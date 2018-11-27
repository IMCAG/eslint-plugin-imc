/**
 * @fileoverview A Library of plugins for ESLINT by IMC
 * @author Daniel Sotzko <daniel.sotzko@im-c.de>
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

// ...

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------


// import all rules in lib/rules
//module.exports.rules = requireIndex(__dirname + "/rules");

module.exports = {
    rules: {
        'brace-style': require('./rules/brace-style.js')
    },
    rulesConfig: {
        'brace-style': ['error', 'imc', {'allowSingleLine': true}], // --fix *3 *4
    }
}
