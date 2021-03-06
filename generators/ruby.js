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
 * @fileoverview Helper functions for generating Ruby
 for blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Ruby');

goog.require('Blockly.Generator');

/**
 * Ruby
 code generator.
 * @type {!Blockly.Generator}
 */
Blockly.Ruby = new Blockly.Generator('Ruby');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Ruby.addReservedWords(
    'alias, and, BEGIN, begin, break, case, class, def, defined?, do, else, elsif, END, end, ensure false, for if, module, next, nil, not, or, redo, rescue, retry, return, self, super, then, true, undef, unless, until, when, while, yield, _ _FILE_ _, _ _LINE_ _'
);

// order of operations precedence reference
// http://ruby-doc.org/core-2.4.1/doc/syntax/precedence_rdoc.html
