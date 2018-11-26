/**
 * @fileoverview Analyzes an if/else construct on its complexity and allows less line breaks (simple if/else) or requires more (if/else/if).
 * @author Daniel Sotzko <daniel.sotzko@im-c.de>
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        type: "layout",
        docs: {
            description: "Analyzes an if/else construct on its complexity and allows less line breaks (simple if/else) or requires more (if/else/if).",
            category: "Layout",
            recommended: false
        },
        fixable: null,  // or "code" or "whitespace"
    },

    create: function(context) {

        let code = context.getSourceCode(),
            re = RegExp('} else if \\((.+)\\) {', 'gm');

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Validates the spacing around array brackets
         * @param {ASTNode} node - The node we're checking for spacing
         * @returns {void}
         */
        function validateIfElseBreaks (node) {
            if (re.test(code.text)) {
                context.report(node, 'Please add breaks in complex if/else/if statements')
            }
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            'IfStatement': validateIfElseBreaks
        };
    }
};
