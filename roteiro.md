# Roteiro
O exercício abaixo destaca uma série de refatorações em um sistema pré-existente de uma locadora de filmes. Inicialmente, esse sistema hipotético possui três classes: `Customer` (clientes), `Movie` (filmes) e `Rental` (aluguéis). 

## Versão inicial
O código inicial do código do sistema encontra-se abaixo. Leia, analise e trascreva para o arquivo `src/index.js` (não copie e cole, pois o ato de escrever o código melhora o seu entendimento).
##### Code block 1
```js
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
```
Tendo todo o conteúdo no arquivo `index.js`, realize um **commit** para salvar o estado inicial.

### Teste unitário
É hora de implementear um teste para o método `statement`. Crie alguns objetos do tipo `Movie`, um `Customer` com alguns aluguéis (objetos do tipo `Rental`) e implemente um teste unitário que deve verificar se a string retornada pelo método `statement` é realmente a saída esperada.

Será necessário criar o hábito de executar esse teste logo após cada refatorção deste roteiro, preferencialmente antes de fazer um *commit*, para nos certificarmos que as funcionalidades do sistema ainda estão funcionando mesmo com mudanças no código. Caso em algum momento o teste aponte uma falha, a refatoração não foi feita corretamente.

#### Exercício: Teste unitário
Escreva um teste unitário para o método `Customer.statement`.

<details>
<summary>Código-fonte: Teste unitário</summary>
  
```js
function test() {
    const c = new Customer("Alice");

    const m1 = new Movie("Interstellar", Movie.CHILDREN);
    const m2 = new Movie("2001", Movie.REGULAR);
    const m3 = new Movie("Ad Astra", Movie.NEW_RELEASE);

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

test();
```
</details>

**COMMIT.**

## Refactoring #1: *Extract Method*
Podemos ver que o método `Customer.statement` é um dos maiores e mais confusos trechos do código. É uma função que realiza muitas tarefas, faz o uso de muitas variáveis locais e abusa da programação procedural. Para resolver essa bagunça, podemos começar extraindo um método para diminuir o tamanho de `statement` menor. Esse novo método poderá ser chamado de `amountFor`, e será responsável pelo cálculo da quantia dos filmes alugados por um cliente, demarcado pelo comentário `Determine amounts for each line`. Após a extração do método, o código de `statement` será:

##### Code block 2
```js
/**
 * @method statement
 * @return {string}
 */
statement() {
    let totalAmount = 0;
    let frequentRenterPoints = 0;

    let result = `Rental Record for ${this.name}\n`;

    for (let rental of this.rentals) {
        let thisAmount = this.amountFor(rental); // <-- novo método!

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
```

#### Exercício: *Extract Method*
Extraia o código demarcado pelo comentário `Determine amounts for each line` para um novo método, para que `statement` fique menor e mais legível ([code block 2](#code-block-2)). Não se esqueça de executar o teste após o refactoring!

<details>
<summary>Código-fonte: Extract Method</summary>
  
```js
class Customer {
    ...

    /**
     * @param {Rental} rental
     * @return {number}
     */
    amountFor(rental) {
        let amount = 0;

        switch (rental.movie.priceCode) {
            case Movie.REGULAR:
                amount += 2;
                if (rental.daysRented > 2) {
                    amount += (rental.daysRented() - 2) * 1.5;
                }
                break;
            case Movie.NEW_RELEASE:
                amount += rental.daysRented * 3;
                break;
            case Movie.CHILDREN:
                    amount += 1.5;
                if (rental.daysRented > 3) {
                    amount += (rental.daysRented - 3) * 1.5;
                }
                break;
        }

        return amount;
    }
    ...
}
```
</details>

**COMMIT.**

## Refactoring #2: *Move Method*
Nesse momento, fica claro que o recém criado método `Customer.amountFor` trata de regras específicas da classe `Rental`. Podemos torná-lo mais coerente movendo-o para a classe `Rental`, já que seu único parâmetro é um objeto `Rental` e usa seus dados para retornar uma nova informação. Esse tipo de refactoring é chamado [`move method`](https://refactoring.guru/move-method), e é utilizado quando desejamos reduzir a interdependência entre classes.

Inicialmente, mova esse método para `Rental`, mas com o nome `getCharge`; a versão antiga vai ser alterada para apenas delegar a chamada para o método movido. A ideia é que refactorings devem ser feitos em pequenos passos, para garantir que nada está sendo quebrado.

##### Code block 3
```js
class Rental {
    ...
    /**
     * @return {number}
     */
    getCharge() { // note que não precisa mais de parâmetro!
        let amount = 0;

        switch (this.movie.priceCode) {
            case Movie.REGULAR:
                amount += 2;
                if (this.daysRented > 2) {
                    amount += (this.daysRented - 2) * 1.5;
                }
                break;
            case Movie.NEW_RELEASE:
                amount += this.daysRented * 3;
                break;
            case Movie.CHILDREN:
                    amount += 1.5;
                if (this.daysRented > 3) {
                    amount += (this.daysRented - 3) * 1.5;
                }
                break;
        }

        return amount;
    }
    ...
}

class Customer {
    ...
    amountFor(rental) {
        return rental.getCharge(); // agora apenas delega chamada para método movido
    }
    ...
}
```
Ao executar os testes e verificar que tudo está funcionando corretamente, o método pode ser removido de `Customer`. Após isso, ainda há um trecho de `Customer.statement` que chama `Customer.amountFor`:

```js
let thisAmount = this.amountFor(rental);
```
Faça-o chamar o novo método de `Rental` e tudo pronto:
```js
let thisAmount = rental.getCharge();
```

#### Exercício: *Move Method*
Mova `Customer.amountFor` para a classe `Rental` com as devidas modificações. Não se esqueça de executar o teste após o refactoring!

<details>
<summary>Código-fonte: Move Method</summary>

```js
class Rental {
    ...
    /**
     * @return {number}
     */
    getCharge() { // note que não precisa mais de parâmetro!
        let amount = 0;

        switch (this.movie.priceCode) {
            case Movie.REGULAR:
                amount += 2;
                if (this.daysRented > 2) {
                    amount += (this.daysRented - 2) * 1.5;
                }
                break;
            case Movie.NEW_RELEASE:
                amount += this.daysRented * 3;
                break;
            case Movie.CHILDREN:
                    amount += 1.5;
                if (this.daysRented > 3) {
                    amount += (this.daysRented - 3) * 1.5;
                }
                break;
        }

        return amount;
    }
    ...
}

class Customer {
    ...
    /**
     * @method statement
     * @return {string}
     */
    statement() {
        let totalAmount = 0;
        let frequentRenterPoints = 0;

        let result = `Rental Record for ${this.name}\n`;

        for (let rental of this.rentals) {
            let thisAmount = rental.getCharge(); // <-- método movido para outra classe

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
    ...
}
```
</details>

**COMMIT.**

## Refactoring #3: *Replace Temp With Query*
O método `Customer.statement` declara a variável local `thisAmount` para executar a regra de negócio. O refactoring *[Replace Temp With Query](https://refactoring.guru/replace-temp-with-query)* substitui uma variável local e temporária (*temp*) por uma chamada de função (*query*). No nosso caso, vamos substituir toda referência a `thisAmount` por uma chamada a `rental.getCharge()`. Veja o código após o refactoring:

#### Code block 4
```js
class Customer {
    ...
    statement() {
        let totalAmount = 0;
        let frequentRenterPoints = 0;

        let result = `Rental Record for ${this.name}\n`;

        for (let rental of this.rentals) {
            frequentRenterPoints++;

            // add bonus for a two day new release rental
            if (rental.movie.priceCode === Movie.NEW_RELEASE && rental.daysRented > 1) {
                frequentRenterPoints++;
            }

            //show figures for this rental
            result += `\t${rental.movie.title}\t${rental.getCharge()}\n`;
            totalAmount += rental.getCharge();
        }

        //add footer lines
        result += `Amount owed is ${totalAmount}\nYou earned ${frequentRenterPoints} frequent renter points`;
        return result;
    }
    ...
}
```
Resumindo o que foi feito acima: `thisAmount` sumiu, sendo substituída por uma chamada a `Rental.getCharge`.

A principal motivação para esse refactoring é se livrar de variáveis temporárias, que tendem a dificultar o entendimento do código (pois você tem que lembrar o que elas armazenam). Claro, pode-se alegar que isso causa um problema de performance, porém esse possível problema pode ser resolvido pelo compilador (isto é, pelas estratégias de otimização de código implementadas pela **V8**, a máquina virtual responsável por executar código JavaScript no Chrome e Node.js).

**COMMIT.**

## Refactoring #4: *Extract Method*
Ainda é possível melhorar a situação de `Customer.statement`, diminuindo seu tamanho e complexidade. Para isso, vamos extrair mais um método que será responsável pela lógica de achar os `frequent renter points` (código relativo ao comentário `add frequent renter points`). Veja como ficará o código de `statement` após refactoring:

#### Code block 5
```js
class Customer {
    statement() {
        let totalAmount = 0;
        let frequentRenterPoints = 0;

        let result = `Rental Record for ${this.name}\n`;

        for (let rental of this.rentals) {
            frequentRenterPoints += rental.getFrequentRenterPoints(); // <-- novo método!

            //show figures for this rental
            result += `\t${rental.movie.title}\t${rental.getCharge()}\n`;
            totalAmount += rental.getCharge();
        }

        //add footer lines
        result += `Amount owed is ${totalAmount}\nYou earned ${frequentRenterPoints} frequent renter points`;
        return result;
    }
}
```

#### Exercício: *Extract Method*
Extraia um método de `Customer.statement` que seja responsável por calcular os `frequent renter points`. `statement` deve chamar esse método como mostrado no [trecho acima](#code-block-5). Em qual classe esse novo método deverá estar localizado, e quais parâmetros deve receber? Não se esqueça de executar o teste após as mudanças.

<details>
<summary>Código fonte: Extract Method</summary>

O método extraído deve estar na classe `Rental` e não precisa de parâmetros adicionais:
```js
class Rental {
    ...
    /**
     * @return {number}
     */
    getFrequentRenterPoints() {
        if (this.movie.priceCode === Movie.NEW_RELEASE && this.daysRented > 1) {
            return 2;
        } else {
            return 1;
        }
    }
    ...
}
```
</details>

**COMMIT.**

## Refactoring #5: Replace Temp With Query
Mais duas variáveis locais (*temp*) do método `statement` agora podem ser extraídas para funções (*queries*). São elas:

* `totalAmount`: pode ser extraída para um novo método chamado `getTotalCharge`;
* `frequentRenterPoints`: pode ser extraída também para um novo método chamado `getTotalFrequentRenterPoints`.

Veja como o código deve ficar com essas refatorações:

##### Code block 6
```js
class Customer {
    ...
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
    ...
}
```

Você já deve estar pensando muitas coisas sobre essas mudanças, e não faz mal perceber alguns possíveis problemas originados por elas:
* O código ficou um pouco maior, mas nem foi tanto assim. Lembre-se de que a extração de método torna o código mais modular, e possibilita um futuro reuso da lógica se necessário. Número de linhas de código não são uma métrica absoluta para a qualidade do código.
* A mudança fez com que o loop no método `statement` seja executado três vezes (uma em `statement`, uma em `getTotalCharge` e mais uma em `getTotalFrequentRenterPoints`). Isso gerará problemas de performance? Teoricamente sim, mas provavelmente na maioria dos casos não haverá uma diferença significativa, pois os clientes da locadora não terão tantos filmes alugados assim.

#### Exercício: *Replace Temp With Query*
Substitua as variáveis locais `totalAmount` e `frequentRenterPoints` por "queries" (novos métodos).

**COMMIT.**

### Nova feature: Statement em HTML

Até aqui, realizamos muitas mudanças para refatorar o código relacionado ao `statement`, mas agora é hora de mostrar o quanto as refatorações serão benéficas para a manutenabilidade do código no geral. Você agora será designado para uma nova implementação no sistema de alguel de filmes: a emissão do relatório de cliente no formato HTML. Assim como ocorre no atual método `statement`, as informações de todos os aluguéis de um cliente devem ser coletadas e exibidas de uma forma organizada, porém num formato que possa ser lido e apresentado por browsers (HTML) como no exemplo abaixo:

##### Code block 7
```html
<h1>Rental Record for <strong>Alice</strong></h1>

<ul>
    <li>Interstellar: 1.5</li>
    <li>2001: 2</li>
    <li>Ad Astra: 30</li>
</ul>

<p>
Amount owed is <strong>33.5</strong>.<br/>
You earned 4 frequent renter points
</p>
```

#### Exercício: Nova feature
Implemente um novo método, `htmlStatement`, que retorna o relatório de aluguéis de um cliente no formato HTML (similar ao exposto no [trecho acima](#code-block-7)). Também escreva um teste para esse novo método, que deverá ser executado antes de cada commit daqui em diante.

<details>
<summary>Código-fonte: Nova feature</summary>

```js
class Customer {
    ...
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
    ...
}
```
Aqui, vemos uma vantagem: conseguimos reusar todos os métodos criados anteriormente, incluindo: `getCharge`, `getTotalCharge` e `getTotalFrequentRenterPoints`. Por isso, a criação do novo método foi bem rápida e não causou duplicação de código (ou uma duplicação pequena, assumindo que ainda existe alguma lógica repetida, com o método `statement`).
</details>

**COMMIT.**

### Refactoring #7: **Replace Conditional with Polymorphism**
No método `getCharge`, da classe `Rental`, podemos ver que há uma forte dependência de um atributo da classe `Movie` (`priceCode`), o que nos dá um indício de que precisamos refatorá-lo. Esse método pode ser movido completamente para `Movie`, deixando o código mais limpo no geral. Em `Rental.getCharge`, passamos a chamar esse novo método.

```js
class Movie {
    ...
    /**
     * @param {number} daysRented
     * @return {number}
     */
    getCharge(daysRented) {
        let amount = 0;

        switch (this.priceCode) {
            case Movie.REGULAR:
                amount += 2;
                if (daysRented > 2) {
                    amount += (daysRented - 2) * 1.5;
                }
                break;
            case Movie.NEW_RELEASE:
                amount += daysRented * 3;
                break;
            case Movie.CHILDREN:
                    amount += 1.5;
                if (daysRented > 3) {
                    amount += (daysRented - 3) * 1.5;
                }
                break;
        }

        return amount;
    }
    ...
}

class Rental {
    ...

    /**
     * @return {number}
     */
    getCharge() { // agora chama o novo método de Movie
        return this.movie.getCharge(this.daysRented);
    }
    ...
}
```

Partindo do mesmo princípio, também podemos mover `getFrequentRenterPoints` também para a classe `Movie`. Ou seja, é melhor que métodos que usam informações sobre tipos de filme estejam todos na classe `Movie`:

```js
class Movie {
    ...
    /**
     * @return {number}
     */
    getFrequentRenterPoints(daysRented) {
        if (this.priceCode === Movie.NEW_RELEASE && daysRented > 1) {
            return 2;
        } else {
            return 1;
        }
    }
    ...
}

class Rental {
    ...
    /**
     * @return {number}
     */
    getFrequentRenterPoints() {
        return this.movie.getFrequentRenterPoints(this.daysRented);
    }
    ...
}
```
Por fim, herança, como no diagrama abaixo (**errata**: existe um erro no diagrama, que está no livro; onde consta `getCharge`, leia-se `getPriceCode`).

(Diagrama de herança)[inheritance_diagram.png]

