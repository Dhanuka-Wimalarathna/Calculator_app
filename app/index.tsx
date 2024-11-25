import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';

const Calculator = () => {
  const scrollViewRef = useRef<ScrollView>(null); 
  const [input, setInput] = useState<string>(''); 
  const [result, setResult] = useState<string>(''); 
  const [history, setHistory] = useState<string[]>([]); 
  const [showHistory, setShowHistory] = useState<boolean>(false); 
  const [equation, setEquation] = useState<string>(''); 

  // Automatically scroll to the bottom of history when it updates
  useEffect(() => {
    if (showHistory && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [history, showHistory]); // Dependencies: history and showHistory

  const handleButtonPress = (buttonValue: string) => {
    const operators = ['+', '-', '*', '/', 'x', '÷'];
  
    if (buttonValue === "AC") {
      setInput(''); // Clear the input on AC press
      setResult(''); // Clear the result
    } else if (buttonValue === "=") {
      try {
        const evaluatedResult = calculateManually(input); // Manually evaluate the expression
        setEquation(input); // Store the full equation
        setResult(evaluatedResult); // Show the result
        setInput(input); // Keep the equation as input instead of clearing it
        // Add to history after calculation
        setHistory((prevHistory) => [...prevHistory, `${input} = ${evaluatedResult}`]); // Store the calculation in history
      } catch (error) {
        setResult("Can't divide by zero"); // Show an error message if division by zero
      }
    } else if (buttonValue === "←") {
      // Backspace functionality: remove the last character
      setInput(input.slice(0, -1));
    } else if (buttonValue === "%") {
      const operators = ['+', '-', '*', '/', 'x', '÷'];
      
      // Find the last number in the input
      const lastNumberMatch = input.match(/(\d+(\.\d+)?)(?=[^\d]*$)/);
      const precedingOperatorIndex = input.split(/[\+\-\*\/x÷]/).length - 2; // Index of preceding operator
    
      if (lastNumberMatch) {
        const lastNumber = parseFloat(lastNumberMatch[0]);
    
        // Find the preceding part of the equation (if any)
        const expressionParts = input.split(/[\+\-\*\/x÷]/);
        const precedingNumber = expressionParts[precedingOperatorIndex];
        let percentageValue;
    
        // If there's a preceding number, calculate the percentage of that number
        if (precedingNumber) {
          percentageValue = (parseFloat(precedingNumber) * lastNumber) / 100;
        } else {
          // Otherwise, just divide the last number by 100
          percentageValue = lastNumber / 100;
        }
    
        // Replace the input's last number and operator with the percentage result
        const newInput = input.replace(lastNumberMatch[0], String(percentageValue));
        setInput(newInput);
      }
    }
     else if (operators.includes(buttonValue)) {
      // Prevent adding an operator if the last character is already an operator
      if (input === '' || operators.includes(input.slice(-1))) {
        return; // Do nothing if the last character is an operator or the input is empty
      } else {
        setInput(input + buttonValue); // Add the operator if it's valid
      }
    } else if (buttonValue === '.') {
      // Prevent adding more than one decimal point in a number
      const lastNumber = input.split(/[\+\-\*\/x÷]/).pop(); // Get the last number in the input
      if (lastNumber && lastNumber.includes('.')) {
        return; // Do nothing if the last number already has a decimal point
      }
      setInput(input + buttonValue); // Add the decimal point
    } else {
      setInput(input + buttonValue); // Add the number
    }
  };
  

  // Function to manually evaluate the expression
  const calculateManually = (expression: string): string => {
    try {
      let sanitizedExpression = expression
        .replace(/(\d)(π)/g, "$1*$2") 
        .replace(/π/g, String(Math.PI))
        .replace(/÷/g, "/")
        .replace(/x/g, "*");
  
      const numbers = sanitizedExpression.split(/[\+\-\*\/]/).map(Number);
      const operators = sanitizedExpression.match(/[\+\-\*\/]/g) || [];
  
      for (let i = 0; i < operators.length; i++) {
        if (operators[i] === "/" && numbers[i + 1] === 0) {
          return "Can't divide by zero"; // Division by zero case
        }
      }
  
      let result = numbers[0];
      for (let i = 0; i < operators.length; i++) {
        switch (operators[i]) {
          case "+":
            result += numbers[i + 1];
            break;
          case "-":
            result -= numbers[i + 1];
            break;
          case "*":
            result *= numbers[i + 1];
            break;
          case "/":
            result /= numbers[i + 1];
            break;
          default:
            throw new Error("Invalid operator");
        }
      }
  
      return String(Math.round(result * 1e15) / 1e15);
    } catch (error) {
      return "Error"; // Return "Error" for any invalid expressions
    }
  };
  

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Ensures keyboard does not overlap input on iOS/Android
      >
        {/* History Button - Positioned at the top */}
        <TouchableOpacity style={styles.historyButton} onPress={() => setShowHistory(prev => !prev)}>
          <Text style={styles.historyButtonText}>History</Text>
        </TouchableOpacity>

        {/* Displaying the input */}
        <Text style={styles.inputText}>{input || "0"}</Text>
        
        {/* Displaying the result */}
        {result !== '' && <Text style={styles.resultText}>= {result}</Text>}

        {/* History Section */}
        {showHistory && (
          <View style={styles.historyWrapper}>
            <ScrollView
            ref={scrollViewRef} // Assign the reference to the ScrollView
            contentContainerStyle={styles.historyContent}>
            {history.length > 0 ? (
            history.map((entry, index) => (
            <Text key={index} style={styles.historyText}>{entry}</Text>
              ))
              ) : (
            <Text style={styles.historyText}>No History Available</Text>
            )}
            </ScrollView>
        </View>
        )}


        {/* Main Calculator Content */}
        <View style={styles.calculatorContainer}>
          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.buttonAC]} onPress={() => handleButtonPress('AC')}>
                <Text style={styles.buttonText}>AC</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonOperator]} onPress={() => handleButtonPress('%')}>
                <Text style={styles.buttonText}>%</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonOperator]} onPress={() => handleButtonPress('π')}>
                <Text style={styles.buttonText}>π</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonOperator]} onPress={() => handleButtonPress('÷')}>
                <Text style={styles.buttonText}>÷</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.buttonNumber]} onPress={() => handleButtonPress('7')}>
                <Text style={styles.buttonText}>7</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonNumber]} onPress={() => handleButtonPress('8')}>
                <Text style={styles.buttonText}>8</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonNumber]} onPress={() => handleButtonPress('9')}>
                <Text style={styles.buttonText}>9</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonOperator]} onPress={() => handleButtonPress('x')}>
                <Text style={styles.buttonText}>x</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.buttonNumber]} onPress={() => handleButtonPress('4')}>
                <Text style={styles.buttonText}>4</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonNumber]} onPress={() => handleButtonPress('5')}>
                <Text style={styles.buttonText}>5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonNumber]} onPress={() => handleButtonPress('6')}>
                <Text style={styles.buttonText}>6</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonOperator]} onPress={() => handleButtonPress('-')}>
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.buttonNumber]} onPress={() => handleButtonPress('1')}>
                <Text style={styles.buttonText}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonNumber]} onPress={() => handleButtonPress('2')}>
                <Text style={styles.buttonText}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonNumber]} onPress={() => handleButtonPress('3')}>
                <Text style={styles.buttonText}>3</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonOperator]} onPress={() => handleButtonPress('+')}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.button, styles.buttonDecimal]} onPress={() => handleButtonPress('.')}>
                <Text style={styles.buttonText}>.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonNumber]} onPress={() => handleButtonPress('0')}>
                <Text style={styles.buttonText}>0</Text>
              </TouchableOpacity>      
              <TouchableOpacity style={[styles.button, styles.buttonBackspace]} onPress={() => handleButtonPress('←')}>
                <Text style={styles.buttonText}>←</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonEqual]} onPress={() => handleButtonPress('=')}>
                <Text style={styles.buttonText}>=</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView> 
    </TouchableWithoutFeedback> //makes it easy for users to hide the keyboard.
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between', // Keeps calculator buttons at the bottom
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  inputResultContainer: { // New container for input and result
    width: '100%',
    marginBottom: 20,
  },
  inputText: {
    fontSize: 50,
    marginTop: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    width: '100%',
    color: 'white',
  },
  resultText: {
    fontSize: 30,
    marginTop: 10,
    textAlign: 'right',
    width: '100%',
    color: 'gray',
  },
  historyButton: {
    padding: 10,
    backgroundColor: '#9E9E9E',
    borderRadius: 5,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  historyButtonText: {
    fontSize: 18,
    fontFamily: 'poppins',
    color: 'black',
  },
  historyContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f4f4f4',
    borderRadius: 5,
    width: '100%',
  },
  historyText: {
    fontFamily: 'poppins',
    fontSize: 16,
    color: 'black',
    marginBottom: 5,
  },
  calculatorContainer: {
    width: '100%',
    marginTop: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    margin: 5,
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
  },
  buttonAC: {
    backgroundColor: '#F44336',
  },
  buttonOperator: {
    backgroundColor: '#4CAF50',
  },
  buttonNumber: {
    backgroundColor: '#3E3E3E',
  },
  buttonDecimal: {
    backgroundColor: '#3E3E3E',
  },
  buttonBackspace: {
    backgroundColor: '#3E3E3E',
  },
  buttonEqual: {
    backgroundColor: '#FF9800',
  },
  historyWrapper: {
    maxHeight: '30%', // Ensure the history section doesn't occupy too much space
    width: '100%',
    backgroundColor: '#f4f4f4',
    borderRadius: 5,
    marginTop: 10,
    padding: 10,
  },
  historyContent: {
    paddingBottom: 10,
  },
});

export default Calculator;
