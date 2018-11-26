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
        'ifelse-brace-style': require('./rules/ifelse-brace-style.js')
    },
    rulesConfig: {
        'ifelse-brace-style': 0
    }
}
