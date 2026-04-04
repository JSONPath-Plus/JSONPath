/* eslint-disable camelcase -- Convenient */
import {checkBuiltInVMAndNodeVM} from "../test-helpers/checkVM.js";

checkBuiltInVMAndNodeVM(function (vmType, setBuiltInState) {
    describe(`JSONPath - Nested Expressions (${vmType})`, function () {
        before(setBuiltInState);

        it("nested filter expression to select parent via matching on nested child", () => {
            const json = {
                name: "root",
                children: [
                    {
                        name: "child1",
                        grand_children: [{name: "child1_1"}, {name: "child1_2"}]
                    },
                    {name: "child2", grand_children: [{name: "child2_1"}]},
                    {
                        name: "child3",
                        grand_children: [{name: "child3_1"}, {name: "child3_2"}]
                    }
                ]
            };
            const result = jsonpath({
                json,
                path: "$.children[?(@.grand_children[?(@.name=='child2_1')])]",
                resultType: "all"
            });
            assert.deepEqual(result, [
                {
                    path: "$['children'][1]",
                    value: json.children[1],
                    parent: json.children,
                    parentProperty: 1,
                    hasArrExpr: true,
                    pointer: "/children/1"
                }
            ]);
        });

        it("nested filter expression that also has a nested filter expression", () => {
            const json = [{
                name: "grand_parent_a",
                children: [
                    {
                        name: "child1a",
                        grand_children: [{name: "child1_1a"}, {name: "child1_2a"}]
                    },
                    {name: "child2a", grand_children: [{name: "child2_1a"}]},
                    {
                        name: "child3a",
                        grand_children: [{name: "child3_1a"}, {name: "child3_2a"}]
                    }
                ]
            }, {
                name: "grand_parent_b",
                children: [
                    {
                        name: "child1b",
                        grand_children: [{name: "child1_1b"}, {name: "child1_2b"}]
                    },
                    {name: "child2b", grand_children: [{name: "child2_1b"}]},
                    {
                        name: "child3b",
                        grand_children: [{name: "child3_1b"}, {name: "child3_2b"}]
                    }
                ]
            }];
            const result = jsonpath({
                json,
                path: "$[?(@.children[?(@.grand_children[?(@.name=='child2_1b')])])]",
                flatten: true,
                resultType: "all"
            });
            assert.deepEqual(result, [
                {
                    path: "$[1]",
                    value: json[1],
                    parent: json,
                    parentProperty: 1,
                    hasArrExpr: true,
                    pointer: "/1"
                }
            ]);
        });

        it("nested filter expression (4 levels)", () => {
            const json = [{
                a: [{
                    b: [{
                        c: [{
                            d: [{e: 1}]
                        }]
                    }]
                }]
            }, {
                a: [{
                    b: [{
                        c: [{
                            d: [{e: 2}]
                        }]
                    }]
                }]
            },
            {
                a: [{
                    b: [{
                        c: [{
                            d: [{e: 3}]
                        }]
                    }]
                }]
            }];
            const result = jsonpath({
                json,
                path: "$[?(@.a[?(@.b[?(@.c[?(@.d[?(@.e==2)])])])])]",
                flatten: true,
                resultType: "all"
            });
            assert.deepEqual(result, [
                {
                    path: "$[1]",
                    value: json[1],
                    parent: json,
                    parentProperty: 1,
                    hasArrExpr: true,
                    pointer: "/1"
                }
            ]);
        });

        it("filter expression with subfilter (json-path-comparison)", () => {
            const json = [
                {
                    a: [{price: 1}, {price: 3}]
                },
                {
                    a: [{price: 11}]
                },
                {
                    a: [{price: 8}, {price: 12}, {price: 3}]
                },
                {
                    a: []
                }
            ];
            const result = jsonpath({
                json,
                path: "$[?(@.a[?(@.price>10)])]",
                resultType: "all"
            });
            assert.deepEqual(result, [
                {
                    path: "$[1]",
                    value: json[1],
                    parent: json,
                    parentProperty: 1,
                    hasArrExpr: true,
                    pointer: "/1"
                },
                {
                    path: "$[2]",
                    value: json[2],
                    parent: json,
                    parentProperty: 2,
                    hasArrExpr: true,
                    pointer: "/2"
                }
            ]);
        });

        it("draft ietf jsonpath (base 21) nested filter example", () => {
            const json = {
                "a": [3, 5, 1, 2, 4, 6,
                    {"b": "j"},
                    {"b": "k"},
                    {"b": {}},
                    {"b": "kilo"}],
                "o": {"p": 1, "q": 2, "r": 3, "s": 5, "t": {"u": 6}},
                "e": "f"
            };
            const result = jsonpath({
                json,
                path: "$[?(@[?(@.b)])]",
                resultType: "all"
            });
            assert.deepEqual(result, [
                {
                    path: "$['a']",
                    value: json.a,
                    parent: json,
                    parentProperty: 'a',
                    hasArrExpr: true,
                    pointer: "/a"
                }
            ]);
        });

        it('Nested filter with string comparison in nested path', () => {
            const json = [{
                items: [
                    {type: "urgent", priority: 1},
                    {type: "normal", priority: 2}
                ]
            }, {
                items: [
                    {type: "normal", priority: 3}
                ]
            }, {
                items: [
                    {type: "urgent", priority: 1},
                    {type: "urgent", priority: 2}
                ]
            }];
            // This tests the string literal handling in nested filter extraction
            const result = jsonpath({
                json,
                path: "$[?(@.items[?(@.type=='urgent')])]",
                resultType: 'value'
            });
            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0].items[0].type, 'urgent');
            assert.strictEqual(result[1].items[0].type, 'urgent');
        });

        it('Nested filter with regex pattern', () => {
            const json = [{
                emails: [
                    {address: "john@example.com"},
                    {address: "jane@test.org"}
                ]
            }, {
                emails: [
                    {address: "bob@example.com"}
                ]
            }, {
                emails: [
                    {address: "alice@other.net"}
                ]
            }];
            // This tests regex literal handling in nested filter extraction
            const result = jsonpath({
                json,
                path: '$[?(@.emails[?(@.address.match(/example/))])]',
                resultType: 'value'
            });
            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0].emails[0].address, 'john@example.com');
            assert.strictEqual(result[1].emails[0].address, 'bob@example.com');
        });

        it('Nested filter error handling - invalid nested path', () => {
            const json = {
                items: [
                    {name: "test", value: 10},
                    {name: "other", value: 20}
                ]
            };
            // Nested path with invalid property - should gracefully handle
            const result = jsonpath({
                json,
                path: '$[?(@.nonexistent[?(@.invalid)])]',
                resultType: 'value'
            });
            // Should return empty array, not throw
            assert.deepEqual(result, []);
        });

        it('Nested filter with double-quoted strings in expression', () => {
            const json = [{
                items: [
                    {status: "active", count: 5},
                    {status: "inactive", count: 2}
                ]
            }, {
                items: [
                    {status: "active", count: 3}
                ]
            }];
            // Test double-quoted string handling in nested filter
            const result = jsonpath({
                json,
                path: '$[?(@.items[?(@.status=="active")])]',
                resultType: 'value'
            });
            assert.strictEqual(result.length, 2);
        });

        it('Nested filter with regex containing forward slashes', () => {
            const json = [{
                files: [
                    {path: "/usr/local/bin/app"},
                    {path: "/home/user/docs"}
                ]
            }, {
                files: [
                    {path: "/usr/bin/tool"}
                ]
            }];
            // Test regex literal with / inside nested filter
            const result = jsonpath({
                json,
                path: '$[?(@.files[?(@.path.match(/\\/usr\\//))])]',
                resultType: 'value'
            });
            assert.strictEqual(result.length, 2);
        });

        it('Nested filter with string literal containing @ in outer filter', () => {
            const json = [{
                items: [{id: 1, status: "active"}],
                marker: "@special"
            }, {
                items: [{id: 2, status: "inactive"}],
                marker: "normal"
            }, {
                items: [{id: 3, status: "active"}],
                marker: "@special"
            }];
            // Filter with nested path AND string literal containing @
            // This tests that @ inside quotes is skipped
            const result = jsonpath({
                json,
                path: '$[?(@.items[?(@.status==\'active\')] && @.marker=="@special")]',
                resultType: 'value'
            });
            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0].marker, '@special');
        });

        it('Nested filter with regex literal in outer filter expression', () => {
            const json = [{
                tags: [{name: "important"}],
                email: "user@example.com"
            }, {
                tags: [{name: "normal"}],
                email: "test@test.org"
            }, {
                tags: [{name: "important"}],
                email: "admin@example.com"
            }];
            // Filter with nested path AND regex in outer expression
            // This tests that @ inside regex is skipped
            const result = jsonpath({
                json,
                path: '$[?(@.tags[?(@.name==\'important\')] && @.email.match(/@example/))]',
                resultType: 'value'
            });
            assert.strictEqual(result.length, 2);
            assert.strictEqual(result[0].email, 'user@example.com');
        });

        it('Nested filter with escaped quotes in string literal', () => {
            const json = [{
                items: [{value: "test"}],
                note: "it's @here"
            }, {
                items: [{value: "test"}],
                note: "normal"
            }];
            // Test escaped quote handling in string literals
            const result = jsonpath({
                json,
                path: "$[?(@.items[?(@.value)] && @.note.match(/it's/))]",
                resultType: 'value'
            });
            assert.strictEqual(result.length, 1);
        });

        it('Nested filter with regex flags', () => {
            const json = [{
                data: [{code: "ABC"}],
                label: "Important"
            }, {
                data: [{code: "xyz"}],
                label: "important"
            }];
            // Test regex with flags (case insensitive)
            const result = jsonpath({
                json,
                path: '$[?(@.data[?(@.code)] && @.label.match(/important/i))]',
                resultType: 'value'
            });
            assert.strictEqual(result.length, 2);
        });

        it('Nested filter with backslash-escaped quotes in string', () => {
            const json = [{
                items: [{name: "test"}],
                desc: 'He said "hello"'
            }, {
                items: [{name: "test"}],
                desc: "normal"
            }];
            // Test escaped quote in string literal - filter has: @.desc == "said \\"hello\\""
            const result = jsonpath({
                json,
                path: String.raw`$[?(@.items[?(@.name)] && @.desc == "said \"hello\"")]`,
                resultType: 'value'
            });
            assert.strictEqual(result.length, 0); // Won't match because desc has single quotes
        });

        it('Nested filter with backslash-escaped forward slash in regex', () => {
            const json = [{
                routes: [{path: "/api/v1"}],
                url: "/api/v1/users"
            }, {
                routes: [{path: "/web"}],
                url: "/web/home"
            }];
            // Test escaped forward slash in regex: /\\/api\\/v1/
            const result = jsonpath({
                json,
                path: String.raw`$[?(@.routes[?(@.path)] && @.url.match(/\/api\/v1/))]`,
                resultType: 'value'
            });
            assert.strictEqual(result.length, 1);
        });
    });
});
