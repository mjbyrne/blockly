/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Ruby for math blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Ruby.math');

goog.require('Blockly.Ruby');


Blockly.Ruby['math_number'] = function(block) {
  // Numeric value.
  var code = parseFloat(block.getFieldValue('NUM'));
  return [code, Blockly.Ruby.ORDER_ATOMIC];
};

Blockly.Ruby['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    'ADD': [' + ', Blockly.Ruby.ORDER_ADDITION],
    'MINUS': [' - ', Blockly.Ruby.ORDER_SUBTRACTION],
    'MULTIPLY': [' * ', Blockly.Ruby.ORDER_MULTIPLICATION],
    'DIVIDE': [' / ', Blockly.Ruby.ORDER_DIVISION],
    'POWER': ['**', Blockly.Ruby.ORDER_COMMA]
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Ruby.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Ruby.valueToCode(block, 'B', order) || '0';
  var code;
  
  code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.Ruby['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.Ruby.valueToCode(block, 'NUM',
        Blockly.Ruby.ORDER_UNARY_NEGATION) || '0';
    if (arg[0] == '-') {
      // --3 is not legal in JS.
      arg = ' ' + arg;
    }
    code = '-' + arg;
    return [code, Blockly.Ruby.ORDER_UNARY_NEGATION];
  }
  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.Ruby.valueToCode(block, 'NUM',
        Blockly.Ruby.ORDER_DIVISION) || '0';
  } else {
    arg = Blockly.Ruby.valueToCode(block, 'NUM',
        Blockly.Ruby.ORDER_NONE) || '0';
  }
  // First, handle cases which generate values that don't need parentheses
  // wrapping the code.
  switch (operator) {
    case 'ABS':
      code = 'Math.abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'Math.sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'Math.log(' + arg + ')';
      break;
    case 'EXP':
      code = 'Math.exp(' + arg + ')';
      break;
    case 'POW10':
      code = 'Math.pow(10,' + arg + ')';
      break;
    case 'ROUND':
      code = 'Math.round(' + arg + ')';
      break;
    case 'ROUNDUP':
      code = 'Math.ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'Math.floor(' + arg + ')';
      break;
    case 'SIN':
      code = 'Math.sin(' + arg + ' / 180 * Math.PI)';
      break;
    case 'COS':
      code = 'Math.cos(' + arg + ' / 180 * Math.PI)';
      break;
    case 'TAN':
      code = 'Math.tan(' + arg + ' / 180 * Math.PI)';
      break;
  }
  if (code) {
    return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
  }
  // Second, handle cases which generate values that may need parentheses
  // wrapping the code.
  switch (operator) {
    case 'LOG10':
      code = 'Math.log(' + arg + ') / Math.log(10)';
      break;
    case 'ASIN':
      code = 'Math.asin(' + arg + ') / Math.PI * 180';
      break;
    case 'ACOS':
      code = 'Math.acos(' + arg + ') / Math.PI * 180';
      break;
    case 'ATAN':
      code = 'Math.atan(' + arg + ') / Math.PI * 180';
      break;
    default:
      throw 'Unknown math operator: ' + operator;
  }
  return [code, Blockly.Ruby.ORDER_DIVISION];
};

Blockly.Ruby['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    'PI': ['Math.PI', Blockly.Ruby.ORDER_MEMBER],
    'E': ['Math.E', Blockly.Ruby.ORDER_MEMBER],
    'GOLDEN_RATIO':
        ['(1 + Math.sqrt(5)) / 2', Blockly.Ruby.ORDER_DIVISION],
    'SQRT2': ['Math.SQRT2', Blockly.Ruby.ORDER_MEMBER],
    'SQRT1_2': ['Math.SQRT1_2', Blockly.Ruby.ORDER_MEMBER],
    'INFINITY': ['Infinity', Blockly.Ruby.ORDER_ATOMIC]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.Ruby['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.Ruby.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.Ruby.ORDER_MODULUS) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    var functionName = Blockly.Ruby.provideFunction_(
        'mathIsPrime',
        ['function ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(n) {',
         '  // https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
         '  if (n == 2 || n == 3) {',
         '    return true;',
         '  }',
         '  // False if n is NaN, negative, is 1, or not whole.',
         '  // And false if n is divisible by 2 or 3.',
         '  if (isNaN(n) || n <= 1 || n % 1 != 0 || n % 2 == 0 ||' +
            ' n % 3 == 0) {',
         '    return false;',
         '  }',
         '  // Check all the numbers of form 6k +/- 1, up to sqrt(n).',
         '  for (var x = 6; x <= Math.sqrt(n) + 1; x += 6) {',
         '    if (n % (x - 1) == 0 || n % (x + 1) == 0) {',
         '      return false;',
         '    }',
         '  }',
         '  return true;',
         '}']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = number_to_check + ' % 1 == 0';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.Ruby.valueToCode(block, 'DIVISOR',
          Blockly.Ruby.ORDER_MODULUS) || '0';
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.Ruby.ORDER_EQUALITY];
};

Blockly.Ruby['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.Ruby.valueToCode(block, 'DELTA',
      Blockly.Ruby.ORDER_ADDITION) || '0';
  var varName = Blockly.Ruby.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return varName + ' = (typeof ' + varName + ' == \'number\' ? ' + varName + ' : 0) + ' + argument0 + ';\n';
};

// Rounding functions have a single operand.
Blockly.Ruby['math_round'] = Blockly.Ruby['math_single'];
// Trigonometry functions have a single operand.
Blockly.Ruby['math_trig'] = Blockly.Ruby['math_single'];

Blockly.Ruby['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list, code;
  switch (func) {
    case 'SUM':
      list = Blockly.Ruby.valueToCode(block, 'LIST',
          Blockly.Ruby.ORDER_MEMBER) || '[]';
      code = list + '.inject(0) {|sum, i|  sum + i }';
      break;
    case 'MIN':
      list = Blockly.Ruby.valueToCode(block, 'LIST',
          Blockly.Ruby.ORDER_COMMA) || '[]';
      code = list + '.min'
      break;
    case 'MAX':
      list = Blockly.Ruby.valueToCode(block, 'LIST',
          Blockly.Ruby.ORDER_COMMA) || '[]';
      code = list + '.max';
      break;
    case 'AVERAGE':
      list = Blockly.Ruby.valueToCode(block, 'LIST',
          Blockly.Ruby.ORDER_NONE) || '[]';
      code = '(' + list + '.inject(0) {|sum, i|  sum + i })/' + list + '.length';
      break;
    case 'MEDIAN':
      // mathMedian([null,null,1,3]) == 2.0.
      var functionName = Blockly.Ruby.provideFunction_(
          'mathMedian',
          ['function ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ +
              '(myList) {',
            '  var localList = myList.filter(function (x) ' +
              '{return typeof x == \'number\';});',
            '  if (!localList.length) return null;',
            '  localList.sort(function(a, b) {return b - a;});',
            '  if (localList.length % 2 == 0) {',
            '    return (localList[localList.length / 2 - 1] + ' +
              'localList[localList.length / 2]) / 2;',
            '  } else {',
            '    return localList[(localList.length - 1) / 2];',
            '  }',
            '}']);
      list = Blockly.Ruby.valueToCode(block, 'LIST',
          Blockly.Ruby.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'MODE':
      // As a list of numbers can contain more than one mode,
      // the returned result is provided as an array.
      // Mode of [3, 'x', 'x', 1, 1, 2, '3'] -> ['x', 1].
      var functionName = Blockly.Ruby.provideFunction_(
          'mathModes',
          ['function ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ +
              '(values) {',
            '  var modes = [];',
            '  var counts = [];',
            '  var maxCount = 0;',
            '  for (var i = 0; i < values.length; i++) {',
            '    var value = values[i];',
            '    var found = false;',
            '    var thisCount;',
            '    for (var j = 0; j < counts.length; j++) {',
            '      if (counts[j][0] === value) {',
            '        thisCount = ++counts[j][1];',
            '        found = true;',
            '        break;',
            '      }',
            '    }',
            '    if (!found) {',
            '      counts.push([value, 1]);',
            '      thisCount = 1;',
            '    }',
            '    maxCount = Math.max(thisCount, maxCount);',
            '  }',
            '  for (var j = 0; j < counts.length; j++) {',
            '    if (counts[j][1] == maxCount) {',
            '        modes.push(counts[j][0]);',
            '    }',
            '  }',
            '  return modes;',
            '}']);
      list = Blockly.Ruby.valueToCode(block, 'LIST',
          Blockly.Ruby.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'STD_DEV':
      var functionName = Blockly.Ruby.provideFunction_(
          'mathStandardDeviation',
          ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(numbers)', 
           '  n = numbers.length',
           '  if n == 0',
           '    return',
           '  else'
           '    mean = (numbers.inject(0) {|sum, i|  sum + i })/numbers.length',
           '    sum = 0',
           '    for i in numbers',
           '      sum = sum + (i - mean) ** 2',
           '    end',
           '    return Math.sqrt(sum / (numbers.length - 1).to_f)',
           '  end',
           'end']);

      list = Blockly.Ruby.valueToCode(block, 'LIST',
          Blockly.Ruby.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    case 'RANDOM':
      var functionName = Blockly.Ruby.provideFunction_(
          'mathRandomList',
          ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(list)',
            '  upper_bound = list.length',
            '  return list[rand(0..upper_bound)]',
            'end']);
      list = Blockly.Ruby.valueToCode(block, 'LIST',
          Blockly.Ruby.ORDER_NONE) || '[]';
      code = functionName + '(' + list + ')';
      break;
    default:
      throw 'Unknown operator: ' + func;
  }
  return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
};

Blockly.Ruby['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.Ruby.valueToCode(block, 'DIVIDEND',
      Blockly.Ruby.ORDER_MODULUS) || '0';
  var argument1 = Blockly.Ruby.valueToCode(block, 'DIVISOR',
      Blockly.Ruby.ORDER_MODULUS) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.Ruby.ORDER_MODULUS];
};

Blockly.Ruby['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.Ruby.valueToCode(block, 'VALUE',
      Blockly.Ruby.ORDER_COMMA) || '0';
  var argument1 = Blockly.Ruby.valueToCode(block, 'LOW',
      Blockly.Ruby.ORDER_COMMA) || '0';
  var argument2 = Blockly.Ruby.valueToCode(block, 'HIGH',
      Blockly.Ruby.ORDER_COMMA) || 'Infinity';
  var code = '[[' + argument0 + ', ' + argument1 + '].max, ' +
      argument2 + '].min';
  return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
};

Blockly.Ruby['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.Ruby.valueToCode(block, 'FROM',
      Blockly.Ruby.ORDER_COMMA) || '0';
  var argument1 = Blockly.Ruby.valueToCode(block, 'TO',
      Blockly.Ruby.ORDER_COMMA) || '0';
  var code = 'rand(' + argument0 + '..' + argument1 + ')';
  return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
};

Blockly.Ruby['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['rand()', Blockly.Ruby.ORDER_FUNCTION_CALL];
};
