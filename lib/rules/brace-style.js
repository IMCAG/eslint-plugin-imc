/**
 * @fileoverview Analyzes an if/else construct on its complexity and allows less line breaks (simple if/else) or requires more (if/else/if).
 * @author Daniel Sotzko <daniel.sotzko@im-c.de>
 */
"use strict";

const astUtils = require("../util/ast-utils");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        type: "layout",

        docs: {
            description: "enforce consistent brace style for blocks",
            category: "Stylistic Issues",
            recommended: false,
            url: "https://eslint.org/docs/rules/brace-style"
        },

        schema: [
            {
                enum: ["1tbs", "stroustrup", "allman"]
            },
            {
                type: "object",
                properties: {
                    allowSingleLine: {
                        type: "boolean"
                    }
                },
                additionalProperties: false
            }
        ],

        fixable: "whitespace",

        messages: {
            nextLineOpen: "Opening curly brace does not appear on the same line as controlling statement.",
            sameLineOpen: "Opening curly brace appears on the same line as controlling statement.",
            blockSameLine: "Statement inside of curly braces should be on next line.",
            nextLineClose: "Closing curly brace does not appear on the same line as the subsequent block.",
            singleLineClose: "Closing curly brace should be on the same line as opening curly brace or on the line after the previous block.",
            sameLineClose: "Closing curly brace appears on the same line as the subsequent block.",
            complexity: "Please harmonize/add breaks in complex if/else/if statements"
        }
    },

    create: function(context) {

        let style = context.options[0] || "1tbs";


        const params = context.options[1] || {},
            sourceCode = context.getSourceCode();

        //--------------------------------------------------------------------------
        // Helpers
        //--------------------------------------------------------------------------

        /**
         * Fixes a place where a newline unexpectedly appears
         * @param {Token} firstToken The token before the unexpected newline
         * @param {Token} secondToken The token after the unexpected newline
         * @returns {Function} A fixer function to remove the newlines between the tokens
         */
        function removeNewlineBetween(firstToken, secondToken) {
            const textRange = [firstToken.range[1], secondToken.range[0]];
            const textBetween = sourceCode.text.slice(textRange[0], textRange[1]);

            // Don't do a fix if there is a comment between the tokens
            if (textBetween.trim()) {
                return null;
            }
            return fixer => fixer.replaceTextRange(textRange, " ");
        }

        /**
         * Validates a pair of curly brackets based on the user's config
         * @param {Token} openingCurly The opening curly bracket
         * @param {Token} closingCurly The closing curly bracket
         * @returns {void}
         */
        function validateCurlyPair(openingCurly, closingCurly) {
            const tokenBeforeOpeningCurly = sourceCode.getTokenBefore(openingCurly);
            const tokenAfterOpeningCurly = sourceCode.getTokenAfter(openingCurly);
            const tokenBeforeClosingCurly = sourceCode.getTokenBefore(closingCurly);
            const singleLineException = params.allowSingleLine && astUtils.isTokenOnSameLine(openingCurly, closingCurly);

            if (style !== "allman" && !astUtils.isTokenOnSameLine(tokenBeforeOpeningCurly, openingCurly)) {
                context.report({
                    node: openingCurly,
                    messageId: "nextLineOpen",
                    fix: removeNewlineBetween(tokenBeforeOpeningCurly, openingCurly)
                });
            }

            if (style === "allman" && astUtils.isTokenOnSameLine(tokenBeforeOpeningCurly, openingCurly) && !singleLineException) {
                context.report({
                    node: openingCurly,
                    messageId: "sameLineOpen",
                    fix: fixer => fixer.insertTextBefore(openingCurly, "\n")
                });
            }

            if (astUtils.isTokenOnSameLine(openingCurly, tokenAfterOpeningCurly) && tokenAfterOpeningCurly !== closingCurly && !singleLineException) {
                context.report({
                    node: openingCurly,
                    messageId: "blockSameLine",
                    fix: fixer => fixer.insertTextAfter(openingCurly, "\n")
                });
            }

            if (tokenBeforeClosingCurly !== openingCurly && !singleLineException && astUtils.isTokenOnSameLine(tokenBeforeClosingCurly, closingCurly)) {
                context.report({
                    node: closingCurly,
                    messageId: "singleLineClose",
                    fix: fixer => fixer.insertTextBefore(closingCurly, "\n")
                });
            }
        }

        /**
         * Validates the location of a token that appears before a keyword (e.g. a newline before `else`)
         * @param {Token} curlyToken The closing curly token. This is assumed to precede a keyword token (such as `else` or `finally`).
         * @returns {void}
         */
        function validateCurlyBeforeKeyword(curlyToken) {
            const keywordToken = sourceCode.getTokenAfter(curlyToken);

            if (style === "1tbs" && !astUtils.isTokenOnSameLine(curlyToken, keywordToken)) {
                context.report({
                    node: curlyToken,
                    messageId: "nextLineClose",
                    fix: removeNewlineBetween(curlyToken, keywordToken)
                });
            }

            if (style !== "1tbs" && astUtils.isTokenOnSameLine(curlyToken, keywordToken)) {
                context.report({
                    node: curlyToken,
                    messageId: "sameLineClose",
                    fix: fixer => fixer.insertTextAfter(curlyToken, "\n")
                });
            }
        }

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        /**
         * Identifies the complexity of an if statement
         * @param {ASTNode} node - The node we're checking for spacing
         * @returns {boolean}
         */
        function isComplexElseIf (node) {
            let re = RegExp('else if \((.+)\) {', 'gm'),
                result = false;

            if (typeof sourceCode.getTokenBefore(node) !== "undefined") {
                if (sourceCode.getTokenBefore(node).value === 'else') {
                    result = re.test("else " + sourceCode.getText(node));
                }
            } else {
                result = re.test(sourceCode.getText(node))
            }

            return result;
        }

        /**
         * Validates the spacing around if brackets
         * @param {ASTNode} node - The node we're checking for spacing
         * @returns {boolean}
         */
        function validateIfElseBreaks (node) {
            let elseIfRe = RegExp('[\\t ]{0,}if \\(.+\\) {[\\r\\n]+[\\t ]{0,}.+[\\r\\n]+[\\t ]{0,}((} else if \\(.+\\) {[\\r\\n]+[\\t ]{0,}.+[\\r\\n]+[\\t ]{0,}){1,})}', 'gm'),
            //let elseIfRe = RegExp('((} else if \\(.+\\) {[\\r\\n]+[\\t ]{0,}.+[\\r\\n]+[\\t ]{0,}){1,})}', 'gm'),
                //elseRe = RegExp('[\\t ]{0,}if \\(.+\\) {[\\r\\n]+[\\t ]{0,}[\\t ]{0,}.+[\\s]{0,}((}[\\t ]{0,}[\\r\\n]+[\\t ]{0,}else if \\(.+\\) {[\\r\\n]+[\\t ]{0,}.+[\\r\\n]+[\\t ]{0,}){1,})} else {[\\r\\n]+[\\t ]{0,}.+[\\r\\n]+[\\t ]{0,}}', 'gm'),
                elseRe = RegExp('((else if \\(.+\\) {[\\r\\n]+[\\t ]{0,}.+[\\r\\n]+[\\t ]{0,}){1,})} else {[\\r\\n]+[\\t ]{0,}.+[\\r\\n]+[\\t ]{0,}}', 'gm'),
                result = true,
                code = sourceCode.getText(node);
                //code = sourceCode.text;

            if (elseIfRe.test(code)) {
                //console.log('else if')
                context.report({
                    node: node,
                    messageId: "complexity",
                });

                result = false;
            }
            else if (elseRe.test(code)) {
                //console.log('else')
                context.report({
                    node: node,
                    messageId: "complexity",
                });

                result = false;
            }

            return result;
        }

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {
            //'IfStatement': validateIfElseBreaks,

            BlockStatement(node) {
                if (!astUtils.STATEMENT_LIST_PARENTS.has(node.parent.type)) {
                    validateCurlyPair(sourceCode.getFirstToken(node), sourceCode.getLastToken(node));
                }
            },
            ClassBody(node) {
                validateCurlyPair(sourceCode.getFirstToken(node), sourceCode.getLastToken(node));
            },
            SwitchStatement(node) {
                const closingCurly = sourceCode.getLastToken(node);
                const openingCurly = sourceCode.getTokenBefore(node.cases.length ? node.cases[0] : closingCurly);

                validateCurlyPair(openingCurly, closingCurly);
            },
            'IfStatement': function (node) {
                let isComplex = isComplexElseIf(node),
                    validIfBreaks = true;

                if (isComplex) {
                    style = "stroustrup";
                } else {
                    style = "1tbs";
                }

                //console.log('############################## VALIDATING TO '+style + ' (' + isComplex + ')');
                //console.log(sourceCode.getText(node))

                if (isComplex) {
                    //console.log(node)
                    validIfBreaks = validateIfElseBreaks(node);
                }

                if (validIfBreaks) {
                    if (node.consequent.type === "BlockStatement" && node.alternate) {

                        // Handle the keyword after the `if` block (before `else`)
                        validateCurlyBeforeKeyword(sourceCode.getLastToken(node.consequent));
                    }
                }
            },
            TryStatement(node) {

                // Handle the keyword after the `try` block (before `catch` or `finally`)
                validateCurlyBeforeKeyword(sourceCode.getLastToken(node.block));

                if (node.handler && node.finalizer) {

                    // Handle the keyword after the `catch` block (before `finally`)
                    validateCurlyBeforeKeyword(sourceCode.getLastToken(node.handler.body));
                }
            }
        };
    }
};
