/**
 * @fileoverview Analyzes an if/else construct on its complexity and allows less line breaks (simple if/else) or requires more (if/else/if).
 * @author Daniel Sotzko
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/ifelse-brace-style"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run("ifelse-brace-style", rule, {
    valid: [
        `
        if (foo) {
            // ...
        } else {
            // ...
        }
        `,
        `
        if (foo) {
            // ...
        } 
        else if (bar) {
            // ...
        }
        else {
            // ...
        }
        `
    ],

    invalid: [
        {
            code: `
                if (foo) {
                    // ...
                } else if (bar) {
                    // ...
                } else {
                    // ...
                }
            `,
            errors: [{
                message: 'Please add breaks in complex if/else/if statements',
                type: 'IfStatement'
            }]
        }
    ]
});
