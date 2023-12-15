/* eslint-disable camelcase */
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
    });
});
