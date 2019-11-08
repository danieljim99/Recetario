import{GraphQLServer} from "graphql-yoga"
import { argsToArgsConfig } from "graphql/type/definition";
import dateTime from "date-time";

let recipeData = [];
let authorData = [];
let ingredientData = [];

const typeDefs =
`
type Recipe {
    title: String!
    description: String!
    date: String!
    author: Author!
    ingredients: [Ingredient!]!
}
type Author {
    name: String!
    email: String!
    recipes: [Recipe!]!
}
type Ingredient {
    name: String!
    recipes: [Recipe!]!
}
type Mutation {
    addRecipe(title: String!, description: String!, author: String!, ingredients: [String!]): Recipe!
    addAuthor(name: String!, email: String!): Author!
    addIngredient(name: String!): Ingredient!

    removeRecipe(title: String!): Recipe!
    removeAuthor(name: String!): Author!
    removeIngredient(name: String!): Ingredient!

    editRecipe(title: String!, newTitle: String!, newDescription: String!, newAuthor: String!, newIngredients: [String!]!): Recipe!
    editAuthor(name: String!, newName: String!, newEmail: String!): Author!
    editIngredient(name: String!, newName: String!): Ingredient!
}
type Query {
    recipes(author: String, ingredient: String): [Recipe!]!
    authors: [Author!]!
    ingredients: [Ingredient!]!
}
`
const resolvers = {
    Recipe: {
        author: (parent, args, ctx, info) => {
            return authorData.find(obj => obj.name === parent.author);
        },
        ingredients: (parent, args, ctx, info) => {
            return ingredientData.filter(obj => parent.ingredients.includes(obj.name));
        },
    },
    Author: {
        recipes: (parent, args, ctx, info) => {
            return recipeData.filter(obj => obj.author === parent.name);
        },
    },
    Ingredient: {
        recipes: (parent, args, ctx, info) => {
            return recipeData.filter(obj => obj.ingredients.includes(parent.name));
        },
    },
    Mutation: {
        addRecipe: (parent, args, ctx, info) => {
            if(recipeData.some(obj => obj.title === args.title)){
                throw new Error (`The title ${args.title} is already in use`);
            }
            if(!authorData.some(obj => obj.name === args.author)){
                throw new Error (`Author with name ${args.author} does not exist`);
            }
            args.ingredients.forEach(elem => {
                if(!ingredientData.some(obj => obj.name === elem)){
                    throw new Error (`Ingredient with name ${elem} does not exist`);
                }
            });
            const recipe = {
                title: args.title,
                description: args.description,
                date: dateTime(),
                author: args.author,
                ingredients: args.ingredients,
            };
            recipeData.push(recipe);
            return recipe;
        },
        addIngredient: (parent, args, ctx, info) => {
            if(ingredientData.some(obj => obj.name === args.name)){
                throw new Error (`The name ${args.name} is already in use`);
            }
            const ingredient = {
                name: args.name,
            };
            ingredientData.push(ingredient);
            return ingredient;
        },
        addAuthor: (parent, args, ctx, info) => {
            if(authorData.some(obj => obj.name === args.name)){
                throw new Error (`The name ${args.name} is already in use`);
            }
            const author = {
                name: args.name,
                email: args.email,
            };
            authorData.push(author);
            return author;
        },
        removeRecipe: (parent, args, ctx, info) => {
            if(!recipeData.some(obj => obj.title === args.title)){
                throw new Error (`Recipe with title ${args.title} does not exist`);
            }
            return recipeData.splice(recipeData.findIndex(obj => obj.title === args.title), 1)[0];
        },
        removeAuthor: (parent, args, ctx, info) => {
            if(!authorData.some(obj => obj.name === args.name)){
                throw new Error (`Author with name ${args.name} does not exist`);
            }
            recipeData.forEach((elem, i) => {
                if(elem.author === args.name){
                    recipeData.splice(i, 1);
                }
            });
            return authorData.splice(authorData.findIndex(obj => obj.name === args.name), 1)[0];
        },
        removeIngredient: (parent, args, ctx, info) => {
            if(!ingredientData.some(obj => obj.name === args.name)){
                throw new Error (`Ingredient with name ${args.name} does not exist`);
            }
            recipeData.forEach((elem, i) => {
                if(elem.ingredients.includes(args.name)){
                    recipeData.splice(i, 1);
                }
            });
            return ingredientData.splice(ingredientData.findIndex(obj => obj.name === args.name), 1)[0];
        },
        editRecipe: (parent, args, ctx, info) => {
            if(!recipeData.some(obj => obj.title === args.title)){
                throw new Error (`Recipe with title ${args.title} does not exist`);
            }
            if(recipeData.some(obj => obj.title === args.newTitle)){
                throw new Error (`The title ${args.newTitle} is already in use`);
            }
            if(authorData.some(obj => obj.name === args.newAuthor)){
                throw new Error (`The name ${args.newAuthor} is already in use`);
            }
            args.newIngredients.forEach(elem => {
                if(ingredientData.some(obj => obj.name === elem)){
                    throw new Error (`The name ${elem} is already in use`);
                }
            });
            return (recipeData.find(obj => obj.title === args.title) = {
                title: args.newTitle,
                description: args.newDescription,
                date: dateTime(),
                author: args.newAuthor,
                ingredients: args.newIngredients,
            });
        },
        editAuthor: (parent, args, ctx, info) => {
            if(!authorData.some(obj => obj.name === args.name)){
                throw new Error (`Author with name ${args.name} does not exist`);
            }
            if(authorData.some(obj => obj.name === args.newName)){
                throw new Error (`The name ${args.newName} is already in use`);
            }
            
        },
        editIngredient: (parent, args, ctx, info) => {

        },
    },
    Query: {
        recipes: (parent, args, ctx, info) => {
            let result = recipeData;
            if(args.author){
                result = result.filter(obj => obj.author.name === args.name);
            }
            if(args.ingredient){
                result = result.filter(obj => obj.ingredients.includes(args.ingredient));
            }
            return result;
        },
        authors: () => {
            return authorData;
        },
        ingredients: () => {
            return ingredientData;
        }
    },
}

const server = new GraphQLServer({typeDefs,resolvers});
server.start(() => console.log("Server started"));