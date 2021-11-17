class Price {
    constructor(){
        if(this.constructor === Price){
            throw new TypeError("Abstract class `Price` can not be instantiated");
        }
    }

    getPriceCode() {
        throw new TypeError("Method `getPriceCode` should be implemented");
    }

    /**
     * @param {number} daysRented
     * @return {number}
     */

    getCharge(daysRented){
        let thisAmount = 0;

        // Determine amount
        switch (this.getPriceCode) {
            case Movie.REGULAR:
                thisAmount += 2;
                if (daysRented > 2) {
                    thisAmount += (daysRented - 2) * 1.5;
                }
                break;
            case Movie.NEW_RELEASE:
                thisAmount += daysRented * 3;
                break;
            case Movie.CHILDREN:
                thisAmount += 1.5;
                if (daysRented > 3) {
                    thisAmount += (daysRented - 3) * 1.5;
                }
                break;
        }
        return thisAmount;
    }

    /**
     * @return {number}
     */

    getFrequentRenterPoints() {
        return 1;
    }
}

class ChildrenPrice extends Price {
    constructor() {super();} 

    /**
     * @return {number}
     */

    getPriceCode() {
        return Movie.CHILDREN;
    }

    /**
     * @inherit
     * @param {number} daysRented
     * @return {number}
     */

    getCharge(daysRented){
        let result = 1.5;

        if(daysRented > 3){
            result += (daysRented - 3) * 1.5;
        }

        return result;
    }
}

class NewReleasePrice extends Price {
    constructor() { super(); }

    /**
     * @return {number}
     */

    getPriceCode() {
        return Movie.NEW_RELEASE;
    }

    /**
     * @inherit
     * @param {number} daysRented
     * @return {number}
     */

     getCharge(daysRented) {
        return daysRented * 3;
    }


    /**
     * @inherit
     * @param {number} daysRented
     * @return {number}
     */
    getFrequentRenterPoints(daysRented) {
        return (daysRented > 1) ? 2 : 1;
    }
}

class RegularPrice extends Price {
    constructor() { super(); }

    /**
     * @return {number}
     */
    getPriceCode() {
        return Movie.REGULAR;
    }

    /**
     * @inherit
     * @param {number} daysRented
     * @return {number}
     */

    getCharge(daysRented) {
        let result = 2;

        if (daysRented > 2) {
            result += (daysRented - 2) * 1.5;
        }

        return result;
    }
}


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
     * @param {Price} price
     * @return {Movie}
     */
    constructor(title, price) {
        this._title = title;
        this._price = price;
    }

    /**
     * @type {string} 
     */
    get title() { return this._title; }

    /**
     * @type {Price}
     */
    get price() { return this._price; }

    /**
     * @param {Price} price
     */
    set price(price) {
        this._price = price;
    }

    /**
     * @param {number} daysRented
     * @return {number}
     */

    getCharge(daysRented){
        return this._price.getCharge(daysRented);
    }

    /**
     * @param {number} daysRented
     * @return {number}
     */

    getFrequentRenterPoints(daysRented) {
        return this._price.getFrequentRenterPoints(daysRented);
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

    /**
     * @return {number}
     */

    getCharge(){
        return this._movie.getCharge(this._daysRented);
    }

    /**
     * @return {number}
     */

    getFrequentRenterPoints(){
        return this._movie.getFrequentRenterPoints(this._daysRented);
    }
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
        let result = `Rental Record for ${this.name}\n`;

        for (let rental of this.rentals) {

            //show figures for this rental
            result += `\t${rental.movie.title}\t${rental.getCharge()}\n`;
        }

        //add footer lines
        result += `Amount owed is ${this.getTotalCharge()}\nYou earned ${this.getTotalFrequentRenterPoints()} frequent renter points`;
        return result;
    }

    /**
     * @method getTotalCharge
     * @return {number}
     */

    getTotalCharge() {
        let result = 0;

        for(let rental of this.rentals){
            result += rental.getCharge();
        }

        return result;
    }

    /**
     * @method getTotalFrequentRenterPoints
     * @return {number}
     */

    getTotalFrequentRenterPoints() {
        let result = 0;

        for(let rental of this.rentals){
            result += rental.getFrequentRenterPoints();
        }

        return result;
    }

    /**
     * @method htmlStatement
     * @return {string}
     */

    htmlStatement(){
        let result = `<h1>Rental Record for <strong>${this._name}</strong></h1>\n`;

        result += `<ul>`

        for(let rental of this._rentals){
            result += `<li>${rental.movie.title}: ${rental.getCharge()}</li>`
        }

        result += `</ul>`

        result += `<p>Amount owed is <strong>${this.getTotalCharge()}</strong>.<br/>You earned ${this.getTotalFrequentRenterPoints()} frequent renter points</p>`;

        return result;
    }
}


function test() {
    const custumer = new Customer("João");

    const movie1 = new Movie("Pulp Fiction", new ChildrenPrice);
    const movie2 = new Movie("Once upon a time in hollywood", new NewReleasePrice);
    const movie3 = new Movie("Django Unchained", new RegularPrice);

    const rental1 = new Rental(movie1, 3);
    const rental2 = new Rental(movie2, 10);
    const rental3 = new Rental(movie3, 1);

    custumer.addRental(rental1);
    custumer.addRental(rental2);
    custumer.addRental(rental3);

    const output = custumer.statement();

    const expectedOutput = 
        `Rental Record for João\n` +
            `\tPulp Fiction\t1.5\n` +
            `\tOnce upon a time in hollywood\t30\n` +
            `\tDjango Unchained\t2\n` +
        `Amount owed is 33.5\nYou earned 4 frequent renter points`;

    const testPassed = expectedOutput === output;

    console.log(testPassed ? 'Test Passed! ' : 'Test Failed...');

    if(!testPassed){
        console.log(`Expected output:\n${expectedOutput}\n\n`);
        console.log(`Actual output:\n${output}\n`);
    }
}

test()
