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
	console.log("\n==== WELCOME TO BAMAZON CUSTOMER VIEW ====\n\nYou are now connected as id " + connection.threadId + "\n");
	// Run the start function after the connection is made to begin the application
	start();
});

// Function that prompts the user
function start() {
	//Displaying all of the items available for sale.
	console.log("These are all the products available on BAMAZON right now: \n");
	connection.query("SELECT id, product_name, price FROM products", function(error, results) {
		if (error) throw error;

		// Log all results of the SELECT statement
		console.log(JSON.stringify(results, null, " ") + "\n\n=========================================================\n\n");

		// Prompt users with two messages:
		inquirer
			.prompt([
				{
					//Asking for ID of the product they would like to buy.
					name: "idChosen",
					type: "input",
					message: "Please enter the ID number of the product you wish to purchase from BAMAZON: "
				},
				{
					//Asking how many units of the product they would like to buy.
					name: "unitsPurchased",
					type: "input",
					message: "How many units of this product would you like to purchase from BAMAZON?"
				}
		]).
		then(function(answer) {
			console.log("\nYOUR ORDER HAS BEEN PLACED!!!\n\nLet me check our stock for you...\n");

			//Creating variables to hold the customer's choices:
			var chosenProductID = answer.idChosen;
			var chosenProductUnits = answer.unitsPurchased;

			// If there is not enough quantities, return message
			connection.query(
				"SELECT * FROM products WHERE ?",
				[
					{
						id: chosenProductID
					}
				],
				function(error, results) {
					if (error) throw error;

					//This variable stores the current stock quantity of the Chosen product
					var currentStock = results[0].stock_quantity;

					if (chosenProductUnits > currentStock){
						//If BAMAZON doesn't have enough stock
						console.log("==== YOUR ORDER HAS BEEN CANCELLED DUE TO INSUFFICIENT QUANTITY ====\n");
						//Calling the continue
						continuePrompt();
					} else {
						// If BAMAZON does have enough of the product, fulfill the customer's order.
						console.log("==== ITEMS ARE IN STOCK - YOUR ORDER HAS BEEN PROCESSED ====\n");

						//set the total cost and information of the product selected
						var id = results[0].id;
						var productName = results[0].product_name;
						var departmentName = results[0].department_name;
						var price = results[0].price;
						var originalStock = results[0].stock_quantity;
						var totalCost = parseFloat(price * chosenProductUnits);

						//Updating the SQL database to reflect the remaining quantity.
						var newChosenProductStock = currentStock - chosenProductUnits;
						connection.query(
							"UPDATE products SET ? WHERE ?",
							[
								{
									stock_quantity: newChosenProductStock
								},
								{
									id: chosenProductID
								}
							],
							function(error, results) {
								//UPDATE SUCCESS!
								console.log("Our product stock quantity of " + originalStock + " has been updated to " + newChosenProductStock + ".\n");

								//Once the update goes through, show the customer the total cost of their purchase.
								console.log(	"=====================================================================================" +
												"\nItem number:\t\t\t" + id +
												"\nProduct Name:\t\t\t" + productName +
												"\nProduct Category:\t\t" + departmentName +
												"\nPrice Per Unit:\t\t\t" + price +
												"\nUnits ordered:\t\t\t" + chosenProductUnits +
												"\n-------------------------------------------------" +
												"\nYOUR TOTAL COST IS:\t\t$" + totalCost +
												"\n=====================================================================================\n\n");

								//Calling the continue
								continuePrompt();
							}
						);
					}
			});
		});
	});
}// End of start function

//Function to ask the customer if they wish to continue with another purchase, or end
function continuePrompt() {
	inquirer
	.prompt(
		{
			name: "continue",
			type: "confirm",
			message: "Would you like to purchase another product?",
		}
	)
	.then(function(answer) {
		if(answer.continue === true) {
			start();
		} else {
			console.log(	"\n==== THANK YOU FOR SHOPPING WITH BAMAZON - GOODBYE ====\n\n");
			connection.end();
		}
	});
}
