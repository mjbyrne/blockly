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
 * @fileoverview Generating Ruby for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Ruby.procedures');

goog.require('Blockly.Ruby');


Blockly.Ruby['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.Ruby.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Ruby.statementToCode(block, 'STACK');
  if (Blockly.Ruby.STATEMENT_PREFIX) {
    branch = Blockly.Ruby.prefixLines(
        Blockly.Ruby.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.Ruby.INDENT) + branch;
  }
  if (Blockly.Ruby.INFINITE_LOOP_TRAP) {
    branch = Blockly.Ruby.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.Ruby.valueToCode(block, 'RETURN',
      Blockly.Ruby.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '  return ' + returnValue + '\n';
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Ruby.variableDB_.getName(block.arguments_[i],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'def ' + funcName + '(' + args.join(', ') + ') \n' +
      branch + returnValue + '\n' + 'end';
  code = Blockly.Ruby.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Ruby.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Ruby['procedures_defnoreturn'] =
    Blockly.Ruby['procedures_defreturn'];

Blockly.Ruby['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Ruby.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Ruby.valueToCode(block, 'ARG' + i,
        Blockly.Ruby.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Ruby.ORDER_FUNCTION_CALL];
};

Blockly.Ruby['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.Ruby.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Ruby.valueToCode(block, 'ARG' + i,
        Blockly.Ruby.ORDER_COMMA) || 'null';
  }
  var code = funcName + '(' + args.join(', ') + ')\n';
  return code;
};

Blockly.Ruby['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Ruby.valueToCode(block, 'CONDITION',
      Blockly.Ruby.ORDER_NONE) || 'false';
  var code = 'if ' + condition + ' \n';
  if (block.hasReturnValue_) {
    var value = Blockly.Ruby.valueToCode(block, 'VALUE',
        Blockly.Ruby.ORDER_NONE) || 'null';
    code += '  return ' + value + '\n';
  } else {
    code += '  return \n';
  }
  code += 'end \n';
  return code;
};
