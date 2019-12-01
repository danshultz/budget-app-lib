const Base = `
type Query {
    dummy: Boolean
}

type Mutation {
    dummy: Boolean
}

type Meta {
    count: Int
}

scalar Date
`;

module.exports = () => [Base];
