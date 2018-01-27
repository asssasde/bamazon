var mysql = require('mysql');
var inquirer = require('inquirer');

var con = mysql.createConnection({
host: "localhost",
user: "root",
password: "Player1#",
database: "bamazon"

});


function sqlConnect(q, type){
con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query(q, function (err, result) {
  if (err) throw err;
  console.log(type);
  console.log(result);
  });
	
  });

};



function options(){
  var options = [
  {
      type: 'list',
      name: 'userOption',
      message: 'menu options:',
      choices: ['View Products for Sale', 'Purchase', 'View Low Inventory', 'Add to Inventory', 'Add New Product'],
    
    }

];

inquirer.prompt(options).then(answers => {
  console.log(JSON.stringify(answers, null, '  '));
		if(answers.userOption ==='View Products for Sale'){
			
			 productSale();
		}
		else if(answers.userOption ==='Purchase'){

			 purchase();
		}
		else if(answers.userOption ==='View Low Inventory'){

			 lowInv();
		}
		else if(answers.userOption ==='Add to Inventory'){
			 
			 addInv();
		}
		else if(answers.userOption ==='Add New Product'){

			addProd();
		};
});

};

function productSale(){
	var querytext= 'SELECT * FROM product';
	var querytype = 'Product data retrieved';
	sqlConnect(querytext, querytype);

};

function purchase(){
var purchase = [
		  {
		   type: 'input',
		   name: 'productId',
		   message: "Please enter product id number"
		   },

		  {
		    type: 'input',
		    name: 'qty',
		    message: "Please enter qty required"
		  }
		];

		inquirer.prompt(purchase).then(answers => {
		  console.log(JSON.stringify(answers, null, '  '));
		
		
		var pid = answers.productId;
		var pi = answers.qty;
		var querytext='UPDATE product SET productInventory = productInventory -';
		querytext += pi;
		querytext += ' WHERE productId =';
		querytext += pid;
		querytext += '; ';
		var querytype ='Purchase completed';
		//console.log(querytext);
		sqlConnect(querytext, querytype);
		purchaseSummary(pi, pid);
		});

};

function purchaseSummary(qty, id){
		

		var querytext ='SELECT productCost * ';
		querytext += qty;
		querytext +=' FROM product WHERE productId =';
		querytext += id;
		querytext += '; ';
		var querytype ='Purchase Summary';
		con.query(querytext, function (err, result) {
  		if (err) throw err;
 			 console.log(querytype);
  		console.log(JSON.stringify(result, null, '  '));
  		});
	
		};

function lowInv(){
	var querytext= 'SELECT * FROM product WHERE productInventory <= 10';
	var querytype = 'Low inventory data retrieved (less than or equal to 10)';
	sqlConnect(querytext, querytype);
};

function addInv(){
var addInv = [
		  {
		   type: 'input',
		   name: 'productId',
		   message: "Pease enter product id number"
		   },

		  {
		    type: 'input',
		    name: 'qty',
		    message: "Please enter new total"
		  }
		];

		inquirer.prompt(addInv).then(answers => {
		  console.log(JSON.stringify(answers, null, '  '));
		
		
		var pid = answers.productId;
		var pi = answers.qty;
		var querytext='UPDATE product SET productInventory =';
		querytext += pi;
		querytext += ' WHERE productId =';
		querytext += pid;
		var querytype ='Item inventory updated';
		sqlConnect(querytext, querytype);
		//console.log (querytext);
		});
	
};

function addProd(){
var addProd = [
		  {
		   type: 'input',
		   name: 'productName',
		   message: "Enter new product name"
		   }, 
		   {
		   type: 'input',
		   name: 'productInventory',
		   message: "Enter Quantity in inventory"
		   }, 
		    {
		   type: 'input',
		   name: 'productCost',
		   message: "Enter unit price"
		   } 
		];

		inquirer.prompt(addProd).then(answers => {
		  console.log(JSON.stringify(answers, null, '  '));
		var pn= '"';
		pn += answers.productName;
		pn += '"';

		var pc = answers.productCost;
		var pi = answers.productInventory;

		var querytext='INSERT INTO product (productName, productInventory, productCost) VALUES('
		querytext += pn;
		querytext += ",";
		querytext += pi;
		querytext += ",";
		querytext += pc;
		querytext += ")";

		var querytype ='Product added';
		//console.log(querytext);
		sqlConnect(querytext, querytype);
		});

};

options();
	