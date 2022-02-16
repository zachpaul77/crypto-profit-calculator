const currency = document.getElementById('currency');
const amount = document.getElementById('amount');
const date = document.getElementById('date');
const errors = document.getElementById('errors');
const results = document.getElementById('results');
const onlyDigitsReg = /^[0-9]+$/;
const decimalValueReg = /^\d+(\.\d{1,2})?$/;

// Show option list of available cryptocurrencies
var clist = '';
for(var i = 0; i < currency_array.length; i++) {
    clist += '<option>' + currency_array[i] + '</option>';
}
var currency_list = document.getElementById("currency_list");
currency_list.innerHTML = clist;


// Check if form input is null
function isNull(obj) {
    if (obj.value === '' || obj.value == null) {
        return true;
    }
    return false;
}

// Binary search, recursively check if input currency in list
function isValidCurrency(arr, value, start, end) {
    // Base Condition
    if (start > end) return false;

    let mid=Math.floor((start + end)/2);
    if (arr[mid]===value) return true;

    // If element at mid is greater than value, search in the left half of mid
    if(arr[mid] > value)
        return isValidCurrency(arr, value, start, mid-1);
    else
        // If element at mid is smaller than value, search in the right half of mid
        return isValidCurrency(arr, value, mid+1, end);
}

// Verify and format date invested
function isValidDate() {
    var dateSplit = date.value.split('-');
    if (dateSplit.length == 3) {
        // Reverse array for API (DD-MM-YYYY --> YYYY-MM-DD)
        dateSplit.reverse();

        // Make sure only digits are included
        for (let i=0; i<3; i++) {
            if (!dateSplit[i].match(onlyDigitsReg)) {
                return false;
            }
        }

        // Cancel if year is not 4 characters
        if (dateSplit[0].length != 4) {
            return false;
        }

        // Verify month and day
        for (let i=1; i<3; i++) {
            // Formatting (e.x. 4 -> 04)
            if (dateSplit[i].length == 1) {
                dateSplit[i] = '0' + dateSplit[i];
            }
            // Cancel if more than 2 characters
            else if (dateSplit[i].length > 2) {
                return false;
            }
        }

        date.value = dateSplit.join('-');
        return true;
    }

    return false;
}

// Send API request and format data for results table
function sendRequest() {
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = false;

    xhr.addEventListener("readystatechange", function() {
        if(this.readyState === 4) {
            var obj = JSON.parse(this.responseText);

            try {
                // Get current date
                let currentDate = new Date();
                let currentMonth = '' + (currentDate.getMonth()+1);
                let currentDay = '' + currentDate.getDate();

                // Format current month
                if (currentMonth.length == 1)
                    currentMonth = '0' + currentMonth;
                if (currentDay.length == 1)
                    currentDay = '0' + currentDay;

                // Get results variables
                let initialUSDVal = obj["Time Series (Digital Currency Daily)"][date.value]["4a. close (USD)"];
                let currentUSDVal = obj["Time Series (Digital Currency Daily)"]['' + currentDate.getFullYear() + '-' + currentMonth + '-' + currentDay]["4a. close (USD)"];
                let coinPercentChange = ((currentUSDVal - initialUSDVal) / initialUSDVal) * 100;
                let totalProfit = Number(amount.value) * (coinPercentChange / 100);
                let currentBalance = Number(amount.value) + totalProfit;

                // Set html for results table
                results.innerHTML = '' +
                "<tr>" +
                "    <td>Value on " + date.value + ": </td>" +
                "    <td class='col2'>$" + Number(initialUSDVal).toFixed(4) + "</td>" +
                "</tr>" +
                "<tr>" +
                "    <td>Value Today: </td>" +
                "    <td class='col2'>$" + Number(currentUSDVal).toFixed(4) + "</td>" +
                "</tr>" +
                "<tr>" +
                "    <td>% Change: </td>" +
                "    <td class='col2'>" + coinPercentChange.toFixed(2) + "%</td>" +
                "</tr>" +
                "<tr>" +
                "    <td>Profit: </td>" +
                "    <td class='col2'>$" + totalProfit.toFixed(2) + "</td>" +
                "</tr>" +
                "<tr>" +
                "    <td>Total Balance: </td>" +
                "    <td class='col2'>$" + currentBalance.toFixed(2) + "</td>" +
                "</tr>";

            } catch (e) {
                results.innerHTML = 'An error has occurred. Try entering a newer date.';
            }

            // Format date to DD-MM-YYYY again
            date.value = date.value.split('-').reverse().join('-');

        }
    });

    xhr.open("GET", "https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=" + currency.value + "&market=USD&apikey=4WR23DZD08B08UAH");
    xhr.send();
}


form.addEventListener('submit', (e) => {
    errorList = [];
    errors.innerText = '';
    results.innerText = '';

    // Validate inputs
    currency.value = currency.value.replace(' ', '');
    currency.value = currency.value.toUpperCase();
    if (isNull(currency) || !isValidCurrency(currency_array, currency.value, 0, currency_array.length-1)) {
        errorList.push("currency");
    }
    if (isNull(amount) || !amount.value.match(decimalValueReg)) {
        errorList.push("amount");
    }
    if (isNull(date) || !isValidDate() ) {
        errorList.push("date");
    }

    // Cancel if errors found
    if (errorList.length > 0) {
        errors.innerText = 'Error: Invalid';
        errors.innerText += ' ' + errorList.join(', ');
    }
    // Send API request and display results
    else {
        sendRequest();
    }

    // Stay on page
    e.preventDefault();
})
