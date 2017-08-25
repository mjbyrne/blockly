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
 * @fileoverview Generating Ruby for text blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Ruby.texts');

goog.require('Blockly.Ruby');


Blockly.Ruby['text'] = function(block) {
  // Text value.
  var code = Blockly.Ruby.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Ruby.ORDER_ATOMIC];
};

Blockly.Ruby['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  //Should we allow joining by '-' or ',' or any other characters?
  switch (block.itemCount_) {
    case 0:
      return ['\'\'', Blockly.Ruby.ORDER_ATOMIC];
      break;
    case 1:
      var element = Blockly.Ruby.valueToCode(block, 'ADD0',
              Blockly.Ruby.ORDER_NONE) || '\'\'';
      var code = 'String(' + element + ')';
      return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
      break;
    case 2:
      var element0 = Blockly.Ruby.valueToCode(block, 'ADD0',
              Blockly.Ruby.ORDER_NONE) || '\'\'';
      var element1 = Blockly.Ruby.valueToCode(block, 'ADD1',
              Blockly.Ruby.ORDER_NONE) || '\'\'';
      var code = 'String(' + element0 + ') + String(' + element1 + ')';
      return [code, Blockly.Ruby.ORDER_ADDITIVE];
      break;
    default:
      var elements = [];
      for (var i = 0; i < block.itemCount_; i++) {
        elements[i] = Blockly.Ruby.valueToCode(block, 'ADD' + i,
                Blockly.Ruby.ORDER_NONE) || '\'\'';
      }
      var tempVar = Blockly.Ruby.variableDB_.getDistinctName('x',
          Blockly.Variables.NAME_TYPE);
      var code = '[' + elements.join(',') + '].join';
      return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
  }
};

Blockly.Ruby['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.Ruby.variableDB_.getName(block.getFieldValue('VAR'),
      Blockly.Variables.NAME_TYPE);
  var value = Blockly.Ruby.valueToCode(block, 'TEXT',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  return varName + ' = String("' + varName + '") + String("' + value + '")\n';
};

Blockly.Ruby['text_length'] = function(block) {
  // Is the string null or array empty?
  var text = Blockly.Ruby.valueToCode(block, 'VALUE',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  return [text + '.length', Blockly.JavaScript.ORDER_MEMBER];
};

Blockly.Ruby['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var text = Blockly.Ruby.valueToCode(block, 'VALUE',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var code = text + '.length < 1';
  return [code, Blockly.Ruby.ORDER_LOGICAL_NOT];
};

Blockly.Ruby['text_indexOf'] = function(block) {
  // Search the text for a substring.
  // Should we allow for non-case sensitive???
  //what is var operator for?
  var operator = block.getFieldValue('END') == 'FIRST' ? 'find' : 'rfind';
  var substring = Blockly.Ruby.valueToCode(block, 'FIND',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var text = Blockly.Ruby.valueToCode(block, 'VALUE',
      Blockly.Ruby.ORDER_MEMBER) || '\'\'';
  var code = text + '.index(' + substring + ')';
  if (block.workspace.options.oneBasedIndex) {
    return [code + ' + 1', Blockly.Ruby.ORDER_ADDITIVE];
  }
  return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
};

Blockly.Ruby['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var text = Blockly.Ruby.valueToCode(block, 'VALUE',
      Blockly.Ruby.ORDER_MEMBER) || '\'\'';
  switch (where) {
    case 'FIRST':
      var code = text + '[0]';
      return [code, Blockly.Ruby.ORDER_MEMBER];
    case 'LAST':
      var code = text + '[-1]';
      return [code, Blockly.Ruby.ORDER_MEMBER];
    case 'FROM_START':
      var at = Blockly.Ruby.getAdjustedInt(block, 'AT');
      var code = text + '[' + at + ']';
      return [code, Blockly.Ruby.ORDER_MEMBER];
    case 'FROM_END':
      var at = Blockly.Ruby.getAdjustedInt(block, 'AT', 1, true);
      var code = text + '[' + at + ']';
      return [code, Blockly.Ruby.ORDER_MEMBER];
    case 'RANDOM':
      Blockly.Ruby.definitions_['import_random'] = 'import random';
      var functionName = Blockly.Ruby.provideFunction_(
          'text_random_letter',
          ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(text)',
           '  x = rand(0..text.length-1)',
           '  return text[x]',
           'end']);
      code = functionName + '(' + text + ')';
      return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
  }
  throw 'Unhandled option (text_charAt).';
};

Blockly.Ruby['text_getSubstring'] = function(block) {
  // Get substring.
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var text = Blockly.Ruby.valueToCode(block, 'STRING',
      Blockly.Ruby.ORDER_MEMBER) || '\'\'';
  switch (where1) {
    case 'FROM_START':
      var at1 = Blockly.Ruby.getAdjustedInt(block, 'AT1');
      if (at1 == '0') {
        at1 = '';
      }
      break;
    case 'FROM_END':
      var at1 = Blockly.Ruby.getAdjustedInt(block, 'AT1', 1, true);
      break;
    case 'FIRST':
      var at1 = '';
      break;
    default:
      throw 'Unhandled option (text_getSubstring)';
  }
  switch (where2) {
    case 'FROM_START':
      var at2 = Blockly.Ruby.getAdjustedInt(block, 'AT2', 1);
      break;
    case 'FROM_END':
      var at2 = Blockly.Ruby.getAdjustedInt(block, 'AT2', 0, true);
      // Ensure that if the result calculated is 0 that sub-sequence will
      // include all elements as expected.
      if (!Blockly.isNumber(String(at2))) {
        Blockly.Ruby.definitions_['import_sys'] = 'import sys';
        at2 += ' or sys.maxsize';
      } else if (at2 == '0') {
        at2 = '';
      }
      break;
    case 'LAST':
      var at2 = '';
      break;
    default:
      throw 'Unhandled option (text_getSubstring)';
  }
  var code = text + '[' + at1 + '..' + at2 + ']';
  return [code, Blockly.Ruby.ORDER_MEMBER];
};

Blockly.Ruby['text_changeCase'] = function(block) {
  // Change capitalization.
  var OPERATORS = {
    'UPPERCASE': '.upcase',
    'LOWERCASE': '.downcase',
    //need to create function for title case and be careful of corner cases
    //'TITLECASE': '.title()'
  };
  var operator = OPERATORS[block.getFieldValue('CASE')];
  var text = Blockly.Ruby.valueToCode(block, 'TEXT',
      Blockly.Ruby.ORDER_MEMBER) || '\'\'';
  var code = text + operator;
  return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
};

Blockly.Ruby['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    'LEFT': '.lstrip',
    'RIGHT': '.rstrip',
    'BOTH': '.strip'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var text = Blockly.Ruby.valueToCode(block, 'TEXT',
      Blockly.Ruby.ORDER_MEMBER) || '\'\'';
  var code = text + operator;
  return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
};

Blockly.Ruby['text_print'] = function(block) {
  // Print statement.
  var msg = Blockly.Ruby.valueToCode(block, 'TEXT',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  return 'puts' + msg + ')\n';
};

Blockly.Ruby['text_prompt_ext'] = function(block) {
  // Prompt function.
  var functionName = Blockly.Ruby.provideFunction_(
      'text_prompt',
      ['def ' + Blockly.Ruby.FUNCTION_NAME_PLACEHOLDER_ + '(msg)',
       '  msg = gets.chomp'
       '  return msg',
       'end']
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.Ruby.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.Ruby.valueToCode(block, 'TEXT',
        Blockly.Ruby.ORDER_NONE) || '\'\'';
  }
  var code = functionName + '(' + msg + ')';
  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = code + '.to_f';
  }
  return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
};

Blockly.Ruby['text_prompt'] = Blockly.Ruby['text_prompt_ext'];

Blockly.JavaScript['text_count'] = function(block) {
  var text = Blockly.JavaScript.valueToCode(block, 'TEXT',
      Blockly.JavaScript.ORDER_MEMBER) || '\'\'';
  var sub = Blockly.JavaScript.valueToCode(block, 'SUB',
      Blockly.JavaScript.ORDER_NONE) || '\'\'';
  var functionName = Blockly.JavaScript.provideFunction_(
      'textCount',
      ['def ' + Blockly.JavaScript.FUNCTION_NAME_PLACEHOLDER_ +'(haystack, needle)',
       '  if needle.length === 0)',
       '    return haystack.length + 1',
       '  else ',
       //need to replace .split(needle) with a ruby equivlent or rework function
       '    return haystack.split(needle).length - 1',
       '  end',
       'end']);
  var code = functionName + '(' + text + ', ' + sub + ')';
  return [code, Blockly.JavaScript.ORDER_SUBTRACTION];
};

Blockly.Ruby['text_replace'] = function(block) {
  var text = Blockly.Ruby.valueToCode(block, 'TEXT',
      Blockly.Ruby.ORDER_MEMBER) || '\'\'';
  var from = Blockly.Ruby.valueToCode(block, 'FROM',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var to = Blockly.Ruby.valueToCode(block, 'TO',
      Blockly.Ruby.ORDER_NONE) || '\'\'';
  var code = text + '.gsub!' +  from + ', ' + to;
  return [code, Blockly.Ruby.ORDER_MEMBER];
};

Blockly.Ruby['text_reverse'] = function(block) {
  var text = Blockly.Ruby.valueToCode(block, 'TEXT',
      Blockly.Ruby.ORDER_MEMBER) || '\'\'';
  var code = text + '.reverse!';
  return [code, Blockly.Ruby.ORDER_MEMBER];
};
