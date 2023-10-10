const { Item } = require('../database/models');
const user = require("./user");
const item = require("./item");

require("dotenv").config();


module.exports = {
  async index(req, res) {
    const userToken = req.params.user_token
    const owner = await user.get(userToken, true);
    if (owner === null) return res.status(200).send('COULD NOT FIND THIS USER');
    const items = await item.getItems(owner.psid);
    const history = await item.getHistories(owner.psid)

    const htmlString = `
    <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>SOCAIL-PAY | ${owner.firstName}'s store</title>

            <!-- Bootstrap -->
            <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
            <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14"></script>
        </head>

        <body style="background-color: rgba(104, 100, 100, 0.274);">
            <div class="container" style="background-color: #fff;" id="content">

                <!-- nav starts here -->
                <nav class="navbar navbar-inverse">
                    <div class="container-fluid">
                    <div class="navbar-header">
                        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        <span class="icon-bar"></span>
                        </button>
                        <a class="navbar-brand" href="#">SOPAY</a>
                    </div>
                    <div class="collapse navbar-collapse" id="myNavbar">
                        <ul class="nav navbar-nav">
                        <li><a :href="'/fund/'+user.psid">Fund wallet</a></li>
                        <li><a href="#history">History</a></li>
                        <li><a href="#store">Store</a></li>
                        <li><a href="#" data-toggle="modal" data-target="#withdrawModal">Withdraw</a></li>
                        </ul>
                        <ul class="nav navbar-nav navbar-right">
                        <!-- <li><a href="https://wa.me/+14155238886/?text=join%20blow-spent"><span class="glyphicon glyphicon-user"></span> Sign Up</a></li> -->
                        <li><a href="https://wa.me/+14155238886/?text=join%20blow-spent"><span class="glyphicon glyphicon-log-in"></span> Log out</a></li>
                        </ul>
                    </div>
                    </div>
                </nav>
                <!-- nav stops here -->


                <!-- body start here -->
                <!-- <div class="container"> -->
                    <div class="row">
                        <div class="col-md-12">
                            <div class="jumbotron">
                                <h1>Welcome to your store</h1>
                                <h4>
                                    {{user.firstName}}&nbsp;{{user.lastName}}
                                    <div style="float: right;text-align: center">
                                        Balance: <br>
                                        <span style="font-size: 30px;" class="badge badge-lg badge-success">{{'$'+Intl.NumberFormat('en-US').format(user.balance)}}</span>
                                        <br>
                                        <small><a :href="'/fund/'+user.psid" >Fund wallet</a></small>
                                        &nbsp|&nbsp <small><a href="#" data-toggle="modal" data-target="#withdrawModal" >Withdraw</a></small>
                                    </div>
                                </h4>
                                

                                <i class="fa fa-envelope" aria-hidden="true"></i>Email: {{user.email}} | 
                                <i class="fa fa-phone" aria-hidden="true"></i>Phone: +{{user.psid}}
                                <br>

                                <i class="fa fa-clock-o" aria-hidden="true"></i> Account created: <strong>{{user.createdAt}}</strong>&nbsp;|&nbsp;
                                <i class="fa fa-times" aria-hidden="true"></i> Temporary link will expire in: <strong class="badge badge-danger">10 mins</strong>
                                <br>
                                <i class="fa fa-money" aria-hidden="true"></i> Sales made: <span class="badge badge-primary">{{history.length}}</span>&nbsp;|&nbsp;
                                <i class="fa fa-cart-plus" aria-hidden="true"></i> Items in store: <span class="badge badge-primary">{{items.length}}</span>
                                <br>
                            </div>
                        </div>
                        <div class="col-md-12" id="store">
                            <h1 class="text-center">ITEMS IN STORE</h1>
                        </div>

                        <div v-for="item in items" class="col-md-3">
                            <div :title="item.name" class=" panel panel-default" style="padding: 0px 12px 0px 12px">
                                <span style="float: right;" class="badge badge-sm">{{item.item_id}}</span>
                                <h4>
                                    {{(item.name.length > 13) ? item.name.slice(0,10)+'...':item.name}}
                                </h4>
                                <small>Created: {{item.createdAt}}</small>
                                <br>Item link: <a target="_blank" :href="'https://wa.me/${process.env.TWILIO_PHONE}/?text=PAY%20'+item.item_id">https://wa.me/${process.env.TWILIO_PHONE.slice(0,5)}...</a><i title="click to copy" class="fa fa-clipboard" aria-hidden="true"></i>
                                <br>
                                Selling price: <strong class="badge">{{'$'+item.cost}}</strong>
                                <hr>
                                <div class="row">
                                    <div class="col-md-6">
                                        <button @click="populateEdit(item)" class="btn btn-primary btn-block btn-sm">Edit <i class="fa fa-pencil" aria-hidden="true"></i></button>
                                    </div>
                                    <div class="col-md-6">
                                        <button @click="deleteFnx(item)" class="btn btn-danger btn-block btn-sm">Delete <i class="fa fa-trash" aria-hidden="true"></i></button>
                                    </div>
                                </div>
                                <br>
                            </div>
                        </div>

                        <!-- histroy start here -->
                        <div id="history" class="col-md-12"><h1 class="text-center">TRANSACTION HISTORY</h1></div>
                        <div class="col-md-12">
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>S/N</th>
                                        <th>Product</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Fee</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(history_, i) in history">
                                        <td>{{i+1}}</td>
                                        <td>{{history_.product}}</td>
                                        <td>{{history_.description}}</td>
                                        <td>{{history_.amount}}</td>
                                        <td>{{history_.profit}}</td>
                                        <td>{{history_.createdAt}}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <!-- history stops here -->

                    </div>
                <!-- </div> -->
                <!-- body stop here -->
            </div>
            <!-- withdraw money -->
        <div class="modal fade" id="withdrawModal" tabindex="-1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="text-center bg-info modal-title">WITHDRAW FROM BALANCE <i class="fa fa-money" aria-hidden="true"></i></h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                    </div>
                    <form action="withdraw/" method="post" id="withdrawForm">
                        <div class="alert alert-danger" id="withdraw-error" role="alert" style="display: none;">
                            <strong>Error: </strong> <span id="withdraw-error-msg"></span>
                        </div>

                        <div class="alert alert-success" id="withdraw-success" role="alert" style="display: none;">
                            <strong>Success: </strong> <span id="withdraw-success-msg"></span>
                        </div>

                    <div class="modal-body">
                            
                            <input type="hidden" class="form-control" required  name="psid_" value="${owner.psid}">
                            <span><strong>Note:</strong> The amount stated will be sent to the account associated with the card used to make last deposit to wallet</span>
                            <br><br><label for="amount">Amount to withdraw</label>
                            <input type="number" max="${owner.balance}" min="5" placeholder="Amount to withdraw" class="form-control"  required id="amount" name="amount">
                            <br>
                            <small>We charge 1% as withdrawal charges</small>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-success">Submit <i class="fa fa-thumbs-o-up" aria-hidden="true"></i></button>
                    </div>
                </form>
                </div>
            </div>
        </div>
            <!-- Edit Modal -->
            <div class="modal fade" id="editModal" tabindex="-1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Edit item <i class="fa fa-pencil" aria-hidden="true"></i></h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                        </div>
                        <form action="edit/" method="post" id="editForm">
                            <div class="alert alert-danger" id="edit-error" role="alert" style="display: none;">
                                <strong>Error: </strong> <span id="edit-error-msg"></span>
                            </div>

                            <div class="alert alert-success" id="edit-success" role="alert" style="display: none;">
                                <strong>Success: </strong> <span id="edit-success-msg"></span>
                            </div>

                        <div class="modal-body">
                                <label for="name">Item name</label>
                                <input type="text" class="form-control" required id="name" name="name">
                                <input type="hidden" class="form-control" required id="id" name="id" >
                                <input type="hidden" class="form-control" required id="user_id" name="user_id" >

                                <label for="cost">Cost</label>
                                <input type="text" class="form-control"  required id="cost" name="cost">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="submit" class="btn btn-success">Submit <i class="fa fa-thumbs-o-up" aria-hidden="true"></i></button>
                        </div>
                    </form>
                    </div>
                </div>
            </div>

            <!-- delete modal -->
            <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="text-center bg-danger modal-title">DELETE ITEM <i class="fa fa-trash" aria-hidden="true"></i></h5>
                                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                        </div>
                        <form action="delete/" method="post" id="deleteForm">
                            <div class="alert alert-danger" id="delete-error" role="alert" style="display: none;">
                                <strong>Error: </strong> <span id="delete-error-msg"></span>
                            </div>

                            <div class="alert alert-success" id="delete-success" role="alert" style="display: none;">
                                <strong>Success: </strong> <span id="delete-success-msg"></span>
                            </div>
                        <div class="modal-body">
                            <p id="del_body"></p>
                            <input type="hidden" class="form-control" required id="del_id" name="del_id">
                            <input type="hidden" class="form-control" required id="del_user_id" name="del_user_id">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-dismiss="modal">No</button>
                            <button type="submit" class="btn btn-danger">Yes <i class="fa fa-trash-o" aria-hidden="true"></i></button>
                        </div>
                    </form>
                    </div>
                </div>
            </div>
            <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
            <!-- Include all compiled plugins (below), or include individual files as needed -->
            <!-- jQuery library -->
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>

                <!-- Latest compiled JavaScript -->
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
                <script>
                    $(function () { // wait for the DOM to be ready
                        $('#editForm').submit(function () { // bind function to submit event of form
                            $.ajax({
                                type: $(this).attr('method'), // get type of request from 'method'
                                url: $(this).attr('action'), // get url of request from 'action'
                                data: $(this).serialize(), // serialize the form's data
                                success: function (responseText) {
                                    // if everything goes well, update the div with the response
                                    document.getElementById('edit-success').style.display = 'block'
                                    document.getElementById('edit-success-msg').innerHTML = responseText
                                    setTimeout(function () {
                                        location.reload()
                                    }, 4000);
                                    // $('#result-edit-success').html(responseText);
                                },
                                error: function (responseText) {
                                    // if everything goes well, update the div with the response
                                    document.getElementById('edit-error').style.display = 'block'
                                    document.getElementById('edit-error-msg').innerHTML = (responseText.statusText) || 'Server error'
                                    setTimeout(function () {
                                        location.reload()
                                    }, 4000);
                                },
                            });
                            return false; // important: prevent the form from submitting
                        });
                    });
                    // WITHDRAW
                 $(function () { // wait for the DOM to be ready
                    $('#withdrawForm').submit(function () { // bind function to submit event of form
                        $.ajax({
                            type: $(this).attr('method'), // get type of request from 'method'
                            url: $(this).attr('action'), // get url of request from 'action'
                            data: $(this).serialize(), // serialize the form's data
                            success: function (responseText) {
                                // if everything goes well, update the div with the response
                                document.getElementById('withdraw-success').style.display = 'block'
                                document.getElementById('withdraw-success-msg').innerHTML = responseText
                                setTimeout(function () {
                                    location.reload()
                                }, 4000);
                                // $('#result-withdraw-success').html(responseText);
                            },
                            error: function (responseText) {
                                // if everything goes well, update the div with the response
                                document.getElementById('withdraw-error').style.display = 'block'
                                document.getElementById('withdraw-error-msg').innerHTML = (responseText.statusText) || 'Server error'
                                setTimeout(function () {
                                    location.reload()
                                }, 4000);
                            },
                        });
                        return false; // important: prevent the form from submitting
                    });
                });
                    // delete buttn is clicked
                    $(function () { // wait for the DOM to be ready
                        $('#deleteForm').submit(function () { // bind function to submit event of form
                            $.ajax({
                                type: $(this).attr('method'), // get type of request from 'method'
                                url: $(this).attr('action'), // get url of request from 'action'
                                data: $(this).serialize(), // serialize the form's data
                                success: function (responseText) {
                                    // if everything goes well, update the div with the response
                                    document.getElementById('delete-success').style.display = 'block'
                                    document.getElementById('delete-success-msg').innerHTML = responseText
                                    setTimeout(function () {
                                        location.reload()
                                    }, 4000);
                                    // $('#result-delete-success').html(responseText);
                                },
                                error: function (responseText) {
                                    // if everything goes well, update the div with the response
                                    document.getElementById('delete-error').style.display = 'block'
                                    document.getElementById('delete-error-msg').innerHTML = (responseText.statusText) || 'Server error'
                                    setTimeout(function () {
                                        location.reload()
                                    }, 4000);
                                },
                            });
                            return false; // important: prevent the form from submitting
                        });
                    });

                    $('#navId a').click(e => {
                        e.preventDefault();
                        $(this).tab('show');
                    });
                </script>
                <script>
                    var data = {
                        user: ${JSON.stringify(owner)},
                        items: ${JSON.stringify(items)},
                        history: ${JSON.stringify(history)},
                        selected: {
                            name: '',
                            cost: 0
                        }
                    }
                
                    new Vue({
                        el: '#content',
                        data,
                        methods: {
                            populateEdit(item_){
                                document.getElementById('id').value = item_.id
                                document.getElementById('name').value = item_.name
                                document.getElementById('cost').value = item_.cost
                                document.getElementById('user_id').value = this.user.id
                                $('#editModal').modal('show');
                            },
                            deleteFnx(item_){
                                var text = 'You are about to delete an item with the follwoing details'
                                    text += '<br>Name: <b>'+item_.name
                                    text += '<br></b>Item ID: <b>'+item_.item_id
                                    text += '<br></b>Item cost: <b>$'+item_.cost
                                    text += '<br></b></b>Are you sure you wish to continue?';

                                document.getElementById('del_body').innerHTML = text
                                document.getElementById('del_id').value = item_.id
                                document.getElementById('del_user_id').value = this.user.id

                                
                                $('#deleteModal').modal('show');
                            },
                        },
                    });
                </script>
            </body>
        </html>`;

    return res.send(htmlString);
  },
  async fundWalletUI(req, res){
      const phone = req.params.psid 
      const htmlString = `<!DOCTYPE html>
      <html lang="en">
  
      <head>
          <meta charset="utf-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>SOCAIL-PAY</title>
  
          <!-- Bootstrap -->
          <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css" integrity="sha512-SfTiTlX6kk+qitfevl/7LibUOeJWlt9rbyDn92a1DqWOw9vWG2MFoays0sgObmWazO5BQPiFucnnEAjpAB+/Sw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
          <script src="https://cdn.jsdelivr.net/npm/vue@2.6.14"></script>
      </head>
  
      <body style="background-color: rgba(104, 100, 100, 0.274);">
          <div class="container" style="background-color: #fff;" id="content">
  
              <!-- nav starts here -->
              <nav class="navbar navbar-inverse">
                  <div class="container-fluid">
                  <div class="navbar-header">
                      <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
                      <span class="icon-bar"></span>
                      <span class="icon-bar"></span>
                      <span class="icon-bar"></span>
                      </button>
                      <a class="navbar-brand" href="#">SOPAY</a>
                  </div>
                  <div class="collapse navbar-collapse" id="myNavbar">
                      <ul class="nav navbar-nav">
                      </ul>
                      <ul class="nav navbar-nav navbar-right">
                      <!-- <li><a href="https://wa.me/+14155238886/?text=join%20blow-spent"><span class="glyphicon glyphicon-user"></span> Sign Up</a></li> -->
                      <li><a href="https://wa.me/+14155238886/?text=join%20blow-spent"><span class="glyphicon glyphicon-log-in"></span> Log out</a></li>
                      </ul>
                  </div>
                  </div>
              </nav>
              <!-- nav stops here -->
  
  
  
          </div>
          
          <!-- delete modal -->
          <div class="modal fade" id="fundModal" tabindex="-1" role="dialog" aria-labelledby="modelTitleId" aria-hidden="true">
              <div class="modal-dialog" role="document">
                  <div class="modal-content">
                      <div class="modal-header">
                          <h5 class="text-center bg-info modal-title">FUND WALLET <i class="fa fa-money" aria-hidden="true"></i></h5>
                          <div style="float: right;text-align: center;">
                              <small>Amount to be deposited to wallet: </small>
                              <span class="badge badge-lg" id="total" >$0</span>
                              <br>
                              <small> <strong>Kindly note:</strong> We charge 3% + N0.5 for each deposit to fund wallet</small>
                          </div>
                      </div>
                      <form role="form" style="padding: 30px;" method="post" action="/fund" id="fundForm">
                          <div class="alert alert-danger" id="fund-error" role="alert" style="display: none;">
                              <strong>Error: </strong> <span id="fund-error-msg"></span>
                          </div>
  
                          <div class="alert alert-success" id="fund-success" role="alert" style="display: none;">
                              <strong>Success: </strong> <span id="fund-success-msg"></span>
                          </div>
                          
                          <img src="http://www.prepbootstrap.com/Content/images/shared/misc/creditcardicons.png" alt="dif cards acepted" style="width: 100%;height: auto">
                          <div class="row">
                              <div class="col-xs-12">
                                  <div class="form-group">
                                      <label>Amount</label>
                                      <div class="input-group">
                                          <input id="amount" required type="number" class="form-control" placeholder="Amount to fund wallet" min="5" v-model="amount" onchange="getTotal()" />
                                          <span class="input-group-addon"><span class="fa fa-money"></span></span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div class="row">
                              <div class="col-xs-12">
                                  <div class="form-group">
                                      <label>CARD NUMBER</label>
                                      <div class="input-group">
                                          <input required type="tel" class="form-control" placeholder="Valid Card Number" />
                                          <input type="hidden" value="${phone}" name="psid">
                                          <input type="hidden" value="0" id="amount_" name="amount">
                                          <span class="input-group-addon"><span class="fa fa-credit-card"></span></span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                          <div class="row">
                              <div class="col-xs-7 col-md-7">
                                  <div class="form-group">
                                      <label><span class="hidden-xs">EXPIRATION</span><span class="visible-xs-inline">EXP</span> DATE</label>
                                      <input required type="tel" class="form-control" placeholder="MM / YY" />
                                  </div>
                              </div>
                              <div class="col-xs-5 col-md-5 pull-right">
                                  <div class="form-group">
                                      <label>CV CODE</label>
                                      <input required type="tel" class="form-control" placeholder="CVC" />
                                  </div>
                              </div>
                          </div>
                          <div class="row">
                              <div class="col-xs-12">
                                  <div class="form-group">
                                      <label>CARD OWNER</label>
                                      <input required type="text" class="form-control" placeholder="Card Owner Names" />
                                  </div>
                              </div>
                          </div>
                          <div class="row">
                              <div class="col-xs-12">
                                  <div class="form-group">
                                      <!--div class="alert alert-info" role="alert">
                                          <strong>Kindly note:</strong> We charge 3% + N0.50 for each deposit 
                                      </div-->
                                      <button class="btn btn-success btn-block btn-lg" type="submit">Fund wallet</button>
                                  </div>
                              </div>
                          </div>
                          <small><i class="fa fa-lock" aria-hidden="true"></i> Protected by <a href="https://www.circle.com/en/" target="_blanck"><img style="width: 40px;height: 40px;" src="https://he-s3.s3.amazonaws.com/media/cache/29/57/2957956cc91d6e9d40171d41f4a27bbb.png" alt=""> Circle payments</a></small>
                      </form>
  
                  </div>
              </div>
          </div>
          <!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
          <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
          <!-- Include all compiled plugins (below), or include individual files as needed -->
          <!-- jQuery library -->
              <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.12.4/jquery.min.js"></script>
  
              <!-- Latest compiled JavaScript -->
              <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
              <script>
  
                  function getTotal(){
                      var val = document.getElementById('amount').value;
                      var newTotal = Number(val) - (0.50 + (Number(val) * 0.03))
                      document.getElementById('total').innerHTML = '$'+Intl.NumberFormat('en-US').format(newTotal)
                      document.getElementById('amount_').value = newTotal
                  }
              $('#fundModal').modal({
                  backdrop: 'static',
                  keyboard: false
              })
  
                  $(function () { // wait for the DOM to be ready
                      $('#fundForm').submit(function () { // bind function to submit event of form
                          $.ajax({
                              type: $(this).attr('method'), // get type of request from 'method'
                              url: $(this).attr('action'), // get url of request from 'action'
                              data: $(this).serialize(), // serialize the form's data
                              success: function (responseText) {
                                  // if everything goes well, update the div with the response
                                  document.getElementById('fund-success').style.display = 'block'
                                  document.getElementById('fund-success-msg').innerHTML = responseText
                                  setTimeout(function () {
                                    window.location = 'https://wa.me/+14155238886/?text=wallet' 
                                  }, 4000);
                                  // $('#result-edit-success').html(responseText);
                              },
                              error: function (responseText) {
                                  // if everything goes well, update the div with the response
                                  document.getElementById('fund-error').style.display = 'block'
                                  document.getElementById('fund-error-msg').innerHTML = (responseText.statusText) || 'Server error'
                                  setTimeout(function () {
                                     location.reload()
                                  }, 4000);
                              },
                          });
                          return false; // important: prevent the form from submitting
                      });
                  });
  
                  
                  $('#navId a').click(e => {
                      e.preventDefault();
                      $(this).tab('show');
                  });
              </script>
          </body>
      </html>`;
      return res.status(200).send(htmlString);
  },
  async edit(req, res) {
    return Item.update({
        name: req.body.name,
        cost: req.body.cost}, {where: { id: req.body.id }})
      .then((rowsAffected) => {
        // add to history
        const reply = (rowsAffected[0] === 1) ? 'Item edited succesfully':'Sorry, item already updated. No new changes detected'
        res.status(200).send(reply)
      })
      .catch((e)=>{
        return res.status(200).send('Error updating item. Try again')
      })
  },
  async delete(req, res) {
    console.log(req.body);
    Item.destroy({ where: { id: req.body.del_id } })
    .then((rowsAffected) => {
        // add to history
        const reply = 'Item deleted succesfully'
        res.status(200).send(reply)
      })
      .catch((e)=>{
        return res.status(200).send('Error deleting item. Try again')
      })
}
};
