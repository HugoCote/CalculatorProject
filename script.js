// utils

const dataScreen = {
    result: undefined,
    lhs: "",
    rhs: "",
    operator: undefined,
    error: false,
    ready: true,

    operate: function(operator, lhs, rhs) {
        switch (operator) {
            case "+":
                return lhs + rhs;
            case "*":
                return lhs * rhs;
            case "-":
                return lhs - rhs;
            case "/":
                return lhs / rhs;
            case "%":
                return lhs % rhs;
            default:
                this.setError();
        }
    },

    setError: function(newError = true) {
        this.error = newError;
    },

    clearError: function() {
        this.setError(false);
    },

    isFloat: function(floatStr) {
        return /^\d+\.?\d*$/.test(floatStr);
    },

    runOperate: function() {
        let result = this.operate(this.operator, parseFloat(this.lhs), parseFloat(this.rhs));
        if (result == undefined || this.rhs == "" || this.operator == undefined) {
            this.setError();
            this.ready = false;
            return;
        }
        this.result = result;
        this.lhs = result.toString();
        this.operator = undefined;
        this.ready = true;
        this.rhs = "";
        this.clearError();
    },

    pushOperator: function(operator) {
        let hasComputed = false;
        if (this.lhs === "") this.setError();
        else {
            if (this.operator) {
                this.runOperate();
                hasComputed = true;
            }
            this.operator = operator;
            this.clearError();
        }
        return hasComputed;
    },

    pushDecimal: function() {
        let setLhs = (x) => this.lhs = x;
        let setRhs = (x) => this.rhs = x;
        let setValue = this.operator ? setRhs : setLhs;
        let value = this.operator ? this.rhs : this.lhs;
        if (value === "") { setValue("0."); return; }
        let newValue = value + ".";
        if (!this.isFloat(newValue)) return this.setError();
        setValue(newValue);
        this.clearError();
    },

    pushDigit: function(digit) {
        let setLhs = (x) => this.lhs = x;
        let setRhs = (x) => this.rhs = x;
        // is the left hand side is already set?
        let setValue = this.operator ? setRhs : setLhs;
        let value = this.operator ? this.rhs : this.lhs;
        setValue(value + digit);
        this.clearError();
    },

    clear: function() {
        this.lhs = "";
        this.rhs = "";
        this.operator = undefined;
        this.result = "";
        this.error = false;
        this.ready = true;
    },

    formatFloat: function(float, space = 8) {
        let floatStr = float.toString()
        let roundSize = Math.round(float).toString().length
        if (floatStr.length > space) {
            if (float > Math.pow(10, space)) floatStr = float.toExponential(space - 4);
            else if (float < Math.pow(0.1, space)) floatStr = float.toExponential(space - 4);
            else floatStr = float.toFixed(Math.max(1, space - roundSize)) + "...";
        }
        return floatStr;
    },

    formatUserInput: function() {
        if (this.lhs === "") return "";
        let lhsRepr = this.formatFloat(parseFloat(this.lhs), 7);
        if (!this.operator) return lhsRepr;
        if (this.rhs === "") return lhsRepr + " " + this.operator;
        let rhsRepr = this.formatFloat(parseFloat(this.rhs), 7);
        return lhsRepr + " " + this.operator + " " + rhsRepr;
    },

    formatResult: function() {
        const BAD_RESULT = "Fuck off";
        if (!this.ready) {
            this.setError();
            return BAD_RESULT;
        }
        if (this.result === undefined) return BAD_RESULT;
        if (this.result === Infinity) return this.result;
        if (this.result === NaN) return this.result;
        return this.formatFloat(this.result, 12);
    },

}

// wiring
const calculator = document.querySelector(".calculator")
const display = document.querySelector(".calculator-display")
const usrinput = calculator.querySelector("#user-input")
const result = calculator.querySelector("#result")

const buttons = calculator.querySelector(".all-buttons")
const digits = buttons.querySelectorAll(".digits");
const clear = buttons.querySelector("#clear");
const allclear = buttons.querySelector("#allclear");
const decimal = buttons.querySelector("#decimal");
const equals = buttons.querySelector("#equals");

const operators = buttons.querySelectorAll(".operators");
const remainder = buttons.querySelector("#remainder");
const divide = buttons.querySelector("#divide");
const plus = buttons.querySelector("#plus");
const minus = buttons.querySelector("#minus");
const multiply = buttons.querySelector("#multiply");

function renderScreen(withInput = true, withResult = false) {
    if (withInput) usrinput.textContent = dataScreen.formatUserInput();
    if (!dataScreen.error && withResult) result.textContent = dataScreen.formatResult();
    display.style.background = dataScreen.error ? "#310303" : "#3B3B3B";
}

keymap = {}
buttons.querySelectorAll("button").forEach((button) => {
    keymap[button.value] = button
})

buttons.querySelectorAll("button").forEach((button) => {
    button.addEventListener('click', () => {
        // if (button.value == "Enter" || button.value == "Delete") console.dir(button)
        console.log("User clicked " + button.value);
    });
});

document.addEventListener('keypress', (keyboardEvent) => {
    if (keyboardEvent.key == "/") keyboardEvent.preventDefault()
    let button = keymap[keyboardEvent.key];
    if (button) {
        button.click();
        // keyboardEvent.stopPropagation();
    } else console.log(keyboardEvent.key + " not recognized")
});

operators.forEach((button) => button.addEventListener('click', () => {
    let hasComputed = dataScreen.pushOperator(button.value);
    renderScreen(true, hasComputed);
}));

equals.addEventListener('click', () => {
    dataScreen.runOperate();
    renderScreen(false, true);
});

[clear, allclear].forEach((button) => button.addEventListener('click', () => {
    dataScreen.clear();
    renderScreen(true, true);
}));

digits.forEach((digit) => digit.addEventListener('click', () => {
    dataScreen.pushDigit(digit.value);
    renderScreen(true, false);
}));

decimal.addEventListener('click', () => {
    dataScreen.pushDecimal();
    renderScreen(true, false);
})