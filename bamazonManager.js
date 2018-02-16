//Including the required npm packages
var mysql = require("mysql");
var inquirer = require("inquirer");

// Creating the connection information for the sql database
var connection = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "root",
	password: "",
	database: "bamazon"
});

// Connecting to the mysql server and sql database
connection.connect(function(err) {
	if (err) throw err;
	console.log("\n==== WELCOME TO BAMAZON MANAGER VIEW ====\n\nYou are now connected as id " + connection.threadId + "\n");
	// Run the start function after the connection is made to begin the application
	manager();
});

//Function that prompts the manager
function manager() {
	//Begin a new query to the database
	connection.query("SELECT * FROM products", function(error, results) {
		if (error) throw error;

		//Begin prompt to manager for options:
		inquirer
			.prompt(
				{
					name: "managerPrompt",
					type: "list",
					message: "Please select one of the following Manager Options:",
					choices: ["View Products for Sale", "View Low Inventory",  "Add to Inventory", "Add New Product"],
					default: 0
				}
			)
			.then(function(answer) {
				// console.log("\n" + answer);
				// console.log("\n" + answer.managerPrompt);
				//Switch statement that performs different actions depending on user's choice
				switch(answer.managerPrompt) {

					//If user chooses View Products for Sale
					case "View Products for Sale":
						console.log("\nYou have chosen to view all the products available for sale at BAMAZON");
						viewProducts();
						break;

					//If user chooses View Low Inventory
					case "View Low Inventory":
						console.log("\nYou have chosen to view all the products with current low inventory");
						viewLowInv();
						break;

					//If user chooses Add to Inventory
					case "Add to Inventory":
						console.log("\nYou have chosen to add more quantity of a product to our inventory");
						addInventory();
						break;

					//If user chooses Add New Product
					case "Add New Product":
						console.log("\nYou have chosen to add a new product to our inventory");
						addNewProduct();
						break;

					//If user chooses anything else
					default:
						console.log("\nPlease select one of the options provided");
					}//End of switch statement
			});//End of .then function
	});//End of query
}//End of manager function

//Function that runs when the manager selects View Products for Sale
function viewProducts() {
	console.log("\nThese are all the products available on BAMAZON right now: \n");
	connection.query("SELECT id, product_name, price, stock_quantity FROM products", function(error, results) {
		if (error) throw error;
		console.log(JSON.stringify(results, null, " ") + "\n\n=========================================================\n\n");

		//Calling the continuePrompt() function
		continuePrompt()
	});//End of query
}//End of viewProducts

//Function that runs when the manager selects View Low Inventory
function viewLowInv() {
	console.log("\nThese are all the products with low inventory (below 5) on BAMAZON right now: \n");
	connection.query("SELECT id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5", function(error, results) {
		if (error) throw error;
		//Show only rows with low inventory (below 5)
		console.log(JSON.stringify(results, null, " ") + "\n\n=========================================================\n\n");

		//Calling the continuePrompt() function
		continuePrompt()
	});//End of query
}//End of viewLowInv

//Function that runs when the manager selects Add to Inventory
function addInventory() {
		//Prompt manager how much of which product to add
		inquirer
			.prompt([
				{
					//Asking for ID of the product they would like to restock.
					name: "id",
					type: "input",
					message: "Please enter the ID number of the product you wish to restock inventory on BAMAZON: "
				},
				{
					//Asking how many units of the product they would like to restock.
					name: "unitsToAdd",
					type: "input",
					message: "How many units of this product would you like to add to the inventory on BAMAZON?"
				}
			])
			.then(function(answer) {
				//Creating variables to hold the manager's choices:
				var chosenProductID = answer.id;
				var chosenUnitsToAdd = parseInt(answer.unitsToAdd);

				//Creating a new query
				connection.query("SELECT * FROM products WHERE id = " + chosenProductID, function(error, results) {
					if (error) throw error;

					//Capturing original values of the selected products
					var id = results[0].id;
					var productName = results[0].product_name;
					var departmentName = results[0].department_name;
					var price = results[0].price;
					var originalStock = parseInt(results[0].stock_quantity);

					var newProductStock = parseInt(originalStock + chosenUnitsToAdd);

					//Update the database
					connection.query(
						"UPDATE products SET ? WHERE ?",
						[
							{
								stock_quantity: newProductStock
							},
							{
								id: id
							}
						],
						function(error, results) {
							if (error) throw error;

							//SUCCESS!!
							console.log(	"\n==== YOUR STOCK WAS ADDED SUCCESSFULLY ====" +
											"\n=====================================================================================" +
											"\nItem number:\t\t\t" + id +
											"\nProduct Name:\t\t\t" + productName +
											"\nProduct Category:\t\t" + departmentName +
											"\nPrice Per Unit:\t\t\t" + price +
											"\nOriginal Stock Quantity:\t" + originalStock +
											"\nYou added more stock:\t\t" + chosenUnitsToAdd +
											"\n-------------------------------------------------" +
											"\nTHE NEW STOCK QUANTITY IS:\t" + newProductStock +
											"\n=====================================================================================\n\n");

						//Calling the continuePrompt() function
						continuePrompt()
						}
					);//End of query
				});//End of query
			});//End of .then(function
}//End of addInventory

//Function that runs when the manager selects Add New Product
function addNewProduct() {
	//Prompt the manager for information on the new product
	inquirer
		.prompt([
			{
				name: "productName",
				type: "input",
				message: "What is the name of the new Product you wish to add?"
			},
			{
				name: "productCategory",
				type: "input",
				message: "What is the category of the new Product you wish to add?"
			},
			{
				name: "price",
				type: "input",
				message: "What is the price per unit of the new Product you wish to add? (Enter as 12.99)"
			},
			{
				name: "stockQuantity",
				type: "input",
				message: "How many units of the new Product do you wish to add to the inventory? (Enter a whole number)"
			}
		])
		.then(function(answer) {
			//Establish a new query
			connection.query(
				"INSERT INTO products SET ?",
				{
					product_name: answer.productName,
					department_name: answer.productCategory,
					price: parseFloat(answer.price),
					stock_quantity: parseInt(answer.stockQuantity)
				},
				function(error, results) {
					if (error) throw error;
					//SUCCESS!!!
					console.log(	"\n==== YOUR NEW ITEM WAS ADDED SUCCESSFULLY ====" +
									"\n==============================================" +
									"\nProduct Name:\t\t\t" + answer.productName +
									"\nProduct Category:\t\t" + answer.productCategory +
									"\nPrice Per Unit:\t\t\t$" + parseFloat(answer.price) +
									"\nStock Quantity:\t\t\t" + parseInt(answer.stockQuantity) +
									"\n==============================================\n\n");

				//Calling the continuePrompt() function
				continuePrompt()
				}
			);//End of query
		});//End of .then(function)
}//End of addNewProduct

//Function to ask the customer if they wish to continue with another purchase, or end
function continuePrompt() {
	inquirer
	.prompt(
		{
			name: "continue",
			type: "confirm",
			message: "Would you like to view the Main Menu for Manager View again?",
		}
	)
	.then(function(answer) {
		if(answer.continue === true) {
			manager();
		} else {
			console.log(	"\n==== THANK YOU - GOODBYE ====\n\n");
			//END CONNECTION
			connection.end();
		}
	});
}
