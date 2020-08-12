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
    getCharge(daysRented) {
        return this.price.getCharge(daysRented);
    }

    /**
     * @param {number} daysRented
     * @return {number}
     */
    getFrequentRenterPoints(daysRented) {
        return this.price.getFrequentRenterPoints(daysRented);
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
    getCharge() {
        return this.movie.getCharge(this.daysRented);
    }

    /**
     * @return {number}
     */
    getFrequentRenterPoints() {
        return this.movie.getFrequentRenterPoints(this.daysRented);
    }
}

/**
 * @abstract
 */
class Price {
    constructor() {
        if (this.constructor === Price) {
            throw new TypeError("Abstract class `Price` cannot be instantiated");
        }
    }

    getPriceCode() {
        throw new TypeError("Method `getPriceCode` should be implemented");
    }

    getCharge() {
        throw new TypeError("Method `getCharge` should be implemented");
    }

    /**
     * @return {number}
     */
    getFrequentRenterPoints(daysRented) {
        return 1;
    }
}

class ChildrenPrice extends Price {
    constructor() { super(); }

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
    getCharge(daysRented) {
        let result = 1.5;

        if (daysRented > 3) {
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
     * @method htmlStatement
     * @return {string}
     */
    htmlStatement() {
        let result = `<h1>Rental Record for <strong>${this.name}</strong></h1>\n`;

        result += '<ul>';

        for (let rental of this.rentals) {
            //show figures for this rental
            result += `<li>${rental.movie.title}: ${rental.getCharge()}</li>`;
        }

        result += '</ul>';

        //add footer lines
        result += `<p>Amount owed is <strong>${this.getTotalCharge()}</strong>.<br/>You earned ${this.getTotalFrequentRenterPoints()} frequent renter points</p>`;

        return result;
    }

    /**
     * @method getTotalCharge
     * @return {number}
     */
    getTotalCharge() {
        let result = 0;
        
        for (let rental of this.rentals) {
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
        
        for (let rental of this.rentals) {
            result += rental.getFrequentRenterPoints();
        }

        return result;

    }
}

function statementTest() {
    const c = new Customer("Alice");

    const m1 = new Movie("Interstellar", new ChildrenPrice());
    const m2 = new Movie("2001", new RegularPrice());
    const m3 = new Movie("Ad Astra", new NewReleasePrice());

    const r1 = new Rental(m1, 3);
    const r2 = new Rental(m2, 1);
    const r3 = new Rental(m3, 10);

    c.addRental(r1);
    c.addRental(r2);
    c.addRental(r3);

    const actualOutput = c.statement();

    const expectedOutput =
        `Rental Record for Alice\n` +
            `\tInterstellar\t1.5\n` +
            `\t2001\t2\n` +
            `\tAd Astra\t30\n` +
        `Amount owed is 33.5\nYou earned 4 frequent renter points`;

    const testPassed = expectedOutput === actualOutput;

    console.log(testPassed ? "Ok :)" : "Failed :(");

    if (!testPassed) {
        console.log(`Expected output:\n${expectedOutput}\n\n`);
        console.log(`Actual output:\n${actualOutput}\n`);
    }
}

function htmlStatementTest() {
    const c = new Customer("Alice");

    const m1 = new Movie("Interstellar", new ChildrenPrice());
    const m2 = new Movie("2001", new RegularPrice());
    const m3 = new Movie("Ad Astra", new NewReleasePrice());

    const r1 = new Rental(m1, 3);
    const r2 = new Rental(m2, 1);
    const r3 = new Rental(m3, 10);

    c.addRental(r1);
    c.addRental(r2);
    c.addRental(r3);

    const actualOutput = c.htmlStatement();

    const expectedOutput = `<h1>Rental Record for <strong>Alice</strong></h1>
<ul><li>Interstellar: 1.5</li><li>2001: 2</li><li>Ad Astra: 30</li></ul><p>Amount owed is <strong>33.5</strong>.<br/>You earned 4 frequent renter points</p>`;

    const testPassed = expectedOutput === actualOutput;

    console.log(testPassed ? "Ok :)" : "Failed :(");

    if (!testPassed) {
        console.log(`Expected output:\n${expectedOutput}\n\n`);
        console.log(`Actual output:\n${actualOutput}\n`);
    }
}

statementTest();
htmlStatementTest();
