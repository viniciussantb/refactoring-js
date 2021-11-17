class Movie {
    /**
     * @type {number}
     */
    static get CHILDREN() { return 2; }

    /**
     * @type {number}
     */
    static get REGULAR() { return 0; }

    /**
     * @type {number}
     */
    static get NEW_RELEASE() { return 1; }

    /**
     * @constructor
     * @param {string} title
     * @param {number} priceCode
     * @return {Movie}
     */
    constructor(title, priceCode) {
        this._title = title;
        this._priceCode = priceCode;
    }

    /**
     * @type {string} 
     */
    get title() { return this._title; }

    /**
     * @type {number}
     */
    get priceCode() { return this._priceCode; }

    /**
     * @param {number} priceCode
     */
    set priceCode(priceCode) {
        this._priceCode = priceCode;
    }
}

class Rental {
    /**
     * @param {Movie} movie
     * @param {number} daysRented
     */
    constructor(movie, daysRented) {
        this._movie = movie;
        this._daysRented = daysRented;
    }

    /**
     * @type {Movie} 
     */
    get movie() { return this._movie; }

    /**
     * @type {number}
     */
    get daysRented() { return this._daysRented; }
}

class Customer {
    /**
     * @param {string} name
     */
    constructor(name) {
        this._name = name;
        this._rentals = [];
    }

    /**
     * @type {string}
     */
    get name() { return this._name; }

    /**
     * @type {Rental[]}
     */
    get rentals() { return this._rentals; }

    /**
     * @method addRental
     * @param {Rental} rental
     */
    addRental(rental) {
        this._rentals.push(rental);
    }

    /**
     * @method statement
     * @return {string}
     */
    statement() {
        let totalAmount = 0;
        let frequentRenterPoints = 0;

        let result = `Rental Record for ${this.name}\n`;

        for (let rental of this.rentals) {
            let thisAmount = 0;

            // Determine amounts for each line
            switch (rental.movie.priceCode) {
                case Movie.REGULAR:
                    thisAmount += 2;
                    if (rental.daysRented > 2) {
                        thisAmount += (rental.daysRented - 2) * 1.5;
                    }
                    break;
                case Movie.NEW_RELEASE:
                    thisAmount += rental.daysRented * 3;
                    break;
                case Movie.CHILDREN:
                    thisAmount += 1.5;
                    if (rental.daysRented > 3) {
                        thisAmount += (rental.daysRented - 3) * 1.5;
                    }
                    break;
            }

            frequentRenterPoints++;

            // add bonus for a two day new release rental
            if (rental.movie.priceCode === Movie.NEW_RELEASE && rental.daysRented > 1) {
                frequentRenterPoints++;
            }

            //show figures for this rental
            result += `\t${rental.movie.title}\t${thisAmount}\n`;
            totalAmount += thisAmount;
        }

        //add footer lines
        result += `Amount owed is ${totalAmount}\nYou earned ${frequentRenterPoints} frequent renter points`;
        return result;
    }
}