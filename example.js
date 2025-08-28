// Example JavaScript file for testing Cursor Clone AI features
// Try selecting different parts of this code and using the AI features!

class Calculator {
    constructor() {
        this.history = [];
    }

    add(a, b) {
        const result = a + b;
        this.history.push(`${a} + ${b} = ${result}`);
        return result;
    }

    subtract(a, b) {
        const result = a - b;
        this.history.push(`${a} - ${b} = ${result}`);
        return result;
    }

    multiply(a, b) {
        const result = a * b;
        this.history.push(`${a} * ${b} = ${result}`);
        return result;
    }

    divide(a, b) {
        if (b === 0) {
            throw new Error('Division by zero is not allowed');
        }
        const result = a / b;
        this.history.push(`${a} / ${b} = ${result}`);
        return result;
    }

    getHistory() {
        return this.history;
    }

    clearHistory() {
        this.history = [];
    }
}

// Example usage
const calc = new Calculator();

console.log('Calculator Demo:');
console.log('5 + 3 =', calc.add(5, 3));
console.log('10 - 4 =', calc.subtract(10, 4));
console.log('6 * 7 =', calc.multiply(6, 7));
console.log('15 / 3 =', calc.divide(15, 3));

console.log('History:', calc.getHistory());

// Try these AI features with this code:
// 1. Select the Calculator class and ask AI to explain it
// 2. Select the add method and ask AI to refactor it
// 3. Ask AI to add error handling to the divide method
// 4. Ask AI to create unit tests for the Calculator class
// 5. Ask AI to add a new method like power() or squareRoot()

// Example async function for testing
async function fetchUserData(userId) {
    try {
        const response = await fetch(`https://api.example.com/users/${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Error fetching user data:', error);
        throw error;
    }
}

// Example array operations
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const evenNumbers = numbers.filter(num => num % 2 === 0);
const doubledNumbers = numbers.map(num => num * 2);
const sum = numbers.reduce((acc, num) => acc + num, 0);

console.log('Original numbers:', numbers);
console.log('Even numbers:', evenNumbers);
console.log('Doubled numbers:', doubledNumbers);
console.log('Sum of all numbers:', sum);

// Example object destructuring and spread operator
const person = {
    name: 'John Doe',
    age: 30,
    email: 'john@example.com',
    address: {
        street: '123 Main St',
        city: 'Anytown',
        country: 'USA'
    }
};

const { name, age, ...rest } = person;
const updatedPerson = { ...person, age: 31 };

console.log('Destructured name:', name);
console.log('Destructured age:', age);
console.log('Rest properties:', rest);
console.log('Updated person:', updatedPerson);
