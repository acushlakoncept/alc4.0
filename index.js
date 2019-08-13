
      const supportedCards = {
        visa, mastercard
      };

	  const appState = {

	  };

	  const formatAsMoney = (amount, buyerCountry) => {
		  let country = countries.find(country => country.country === buyerCountry);
		  if(country.country === buyerCountry){
			  return amount.toLocaleString(`en-${country.code}`, {style: 'currency', currency: country.currency})
		  } else {
			  return amount.toLocaleString('en-US', {style: 'currency', currency: 'USD'});
		  }
	  };

	  const detectCardType = (first4Digits) => {
		  
			const fieldOne = document.querySelector('[data-credit-card]');
			const fieldType = document.querySelector('[data-card-type]');
			if(first4Digits.toString().startsWith(4)){
				fieldOne.classList.add('is-visa');
				fieldOne.classList.remove('is-mastercard');
				fieldType.src = supportedCards.visa;
				return "is-visa";
			} else if(first4Digits.toString().startsWith(5)){
				fieldOne.classList.add('is-mastercard');
				fieldOne.classList.remove('is-visa');
				fieldType.src = supportedCards.mastercard;
				return "is-mastercard";
			}
		  
	  };

	  const validateCardExpiryDate = () => {
		  const field = document.querySelector('[data-cc-info] input:nth-child(2)');
		  if(expiryDateFormatIsValid(field)) {
			  const [month, year] = field.value.split('/');
			  const expiryDate = new Date(`20${year}/${month}`);
			  const todaysDate = new Date();

			  if(expiryDate > todaysDate) {
				  flagIfInvalid(field, true);
				  return true;
			  } else {
				  flagIfInvalid(field, false);
				  return false;
			  }
		  } else {
			  flagIfInvalid(field, false);
			  return false;
		  }
	  };

	  const validateCardHolderName = () => {
		  const field = document.querySelector('[data-cc-info] input:nth-child(1)');
		  const regex = /^[A-Za-z]{3,}[\s][a-zA-Z]{3,}$/;

		  if(regex.test(field.value)) {
			  flagIfInvalid(field, true);
			  return true;
		  } else {
			  flagIfInvalid(field, false);
			  return false;
		  }		  
	  };

	  const validateWithLuhn = (digits) => {
		  let total = 0;
		  let sumOddCardNum = 0;
		  let sumEvenCardNum = 0;

		  for(let i=0; i < digits.length; i++){
			  if(i % 2 === 0){
				  if(digits[i]*2 > 9){
					  sumEvenCardNum += digits[i] * 2 - 9;
				  }else {
				  sumEvenCardNum += digits[i] * 2;
				  }
			  	} else {
			  sumOddCardNum += digits[i];
		  	} 
		}

		total = sumOddCardNum + sumEvenCardNum;
		return total % 10 === 0;
	  };

	  const validateCardNumber = () => {
		  let cardNumber = '';
		  const creditCardFields = document.querySelectorAll('[data-cc-digits] input');
		  creditCardFields.forEach(field => {
			  cardNumber += field.value;
		  });

		  cardNumber = cardNumber.toString().split('').map(x=>parseInt(x));
		  const cardField = document.querySelector('[data-cc-digits]');
		  if(validateWithLuhn(cardNumber)) {
			  cardField.classList.remove('is-invalid');
			  return true;
		  } else {
			  cardField.classList.add('is-invalid');
			  return false;
		  }
	  };

	  const validatePayment = () => {
		  validateCardNumber();
		  validateCardHolderName();
		  validateCardExpiryDate();
		};
		
		
	  const smartInput = (event, fieldIndex, fields) => {
		  const isNumber = !Number.isNaN(parseInt(event.key));
		  const currField = fields[fieldIndex];
		  const validKeys = ['Backspace', 'Tab', 'Shift', 'Delete', 'ArrowRight', 'ArrowLeft'];
		  const userInput = parseInt(event.key);
			  if(isNaN(userInput)){
				  return false;
			  }
			
		  if(fieldIndex < 4 && !validKeys.includes(event.key) && !isNumber){
				  event.preventDefault();
			  }
		
			if(currField.value.length < currField.getAttribute("size")) {
						appState.cardDigits[fieldIndex][currField.value.length] = userInput;
						console.log(appState.cardDigits);
						currField.value += userInput;

						//Detect CardType
						  if(fieldIndex == 0){
							  const first4Digits = appState.cardDigits[0];
							  detectCardType(first4Digits);
						  }

						if(fieldIndex < 3){
							setTimeout(() => {
								let inputMask = '';
								let firstDigit = '';
								for(i=0; i<currField.value.length; i++){
									inputMask += '$';
								}

								currField.value = inputMask;
							}, 500);
						}
					}

					if(fieldIndex == 5 && !validKeys.includes(event.key) && event.key !== "/" && !isNumber){
						event.preventDefault();
					} 
		 
		  
	  };

	  
	  const acceptCardNumbers = (event, fieldIndex) => {
		 
	  };

	  const uiCanInteract = () => {
		 
		 const cardNumFields = document.querySelectorAll('[data-cc-digits] input');
		 cardNumFields[0].focus();
		 document.querySelector('[data-pay-btn]').addEventListener('click', validatePayment);
		 billHype();
		 enableSmartTyping();
	  };

	  const displayCartTotal = ({results})=> {
		  let [data] = results;
		  let {itemsInCart, buyerCountry} = data;

		  appState.items = itemsInCart;
		  appState.country = buyerCountry;

		  appState.bill = itemsInCart.reduce((total, {price, qty}) => total + (price * qty), 0);
		  appState.billFormatted = formatAsMoney(appState.bill, appState.country);

		  document.querySelector('[data-bill]').textContent = appState.billFormatted;
		  appState.cardDigits = [];
		  appState.cardDigits[0] = [];
		  appState.cardDigits[1] = [];
		  appState.cardDigits[2] = [];
		  appState.cardDigits[3] = [];

		  uiCanInteract();
	  };

      const flagIfInvalid = (field, isValid) => {
		  if(isValid){
			  field.classList.remove("is-invalid")
		  }else {
			  field.classList.add("is-invalid");
		  }
	  };

	  const expiryDateFormatIsValid = (field) => {
		  return /^\d{1,}\/\d{2}$/g.test(field.value);
	  };
		
	  const smartCursor = (event, fieldIndex, fields) => {
		  if(event.target.value.length  === event.target.size){
				fields[fieldIndex + 1].focus();
			}	
	  };

	  const enableSmartTyping = () => {
		  let inputFields = document.querySelectorAll('input');
		  inputFields.forEach((field, index, fields)=> {
			  field.addEventListener('keyup', event =>{
				  smartCursor(event, index, fields);
			  });
			  field.addEventListener('keydown', event => {
				  smartInput(event, index, fields);
			  });
		  });
	  };
	  


      const countries = [
        {
          code: "US",
          currency: "USD",
          currencyName: '',
          country: 'United States'
        },
        {
          code: "NG",
          currency: "NGN",
          currencyName: '',
          country: 'Nigeria'
        },
        {
          code: 'KE',
          currency: 'KES',
          currencyName: '',
          country: 'Kenya'
        },
        {
          code: 'UG',
          currency: 'UGX',
          currencyName: '',
          country: 'Uganda'
        },
        {
          code: 'RW',
          currency: 'RWF',
          currencyName: '',
          country: 'Rwanda'
        },
        {
          code: 'TZ',
          currency: 'TZS',
          currencyName: '',
          country: 'Tanzania'
        },
        {
          code: 'ZA',
          currency: 'ZAR',
          currencyName: '',
          country: 'South Africa'
        },
        {
          code: 'CM',
          currency: 'XAF',
          currencyName: '',
          country: 'Cameroon'
        },
        {
          code: 'GH',
          currency: 'GHS',
          currencyName: '',
          country: 'Ghana'
        }
      ];

      const billHype = () => {
        const billDisplay = document.querySelector('.mdc-typography--headline4');
        if (!billDisplay) return;

        billDisplay.addEventListener('click', () => {
          const billSpan = document.querySelector("[data-bill]");
          if (billSpan &&
            appState.bill &&
            appState.billFormatted &&
            appState.billFormatted === billSpan.textContent) {
            window.speechSynthesis.speak(
              new SpeechSynthesisUtterance(appState.billFormatted)
            );
          }
        });
      };
      
	  const fetchBill = () => {
        const apiHost = 'https://randomapi.com/api';
		const apiKey = '006b08a801d82d0c9824dcfdfdfa3b3c';
		const apiEndpoint = `${apiHost}/${apiKey}`;
		fetch(apiEndpoint)
        .then(response => response.json())
		.then(data => {
			displayCartTotal(data);
		})
		.catch(error=> {
			console.log(error);
		})
      };
      
      const startApp = () => {
		  fetchBill();
      };

      startApp();
