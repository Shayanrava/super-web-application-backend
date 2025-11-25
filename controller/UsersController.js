import Users from "../models/UserModel.js"


export const getUsers = async (req, res) => {
    try {
        const response = await Users.findAll();
        res.json(response);
    } catch (error) {
        console.log(error);
    }
}

export const singleUser = async (req, res) => {

    try {
        const response = await Users.findOne({
            where: {
                id: req.params.id
            }
        });
        res.json(response);
    } catch (error) {
        res.json({ msg: error.message })
        
    }
}

export const getUserID = async (req, res) => {

    if(!req.body.name || !req.body.password) return res.json({msg:"Name and password are required ."})
    try {
        const response = await Users.findOne({
            attributes: ['id'],
            where: {
                name: req.body.name,
                password: req.body.password
            }
        });
        res.json(response);
    } catch (error) {
        res.json({ msg: error.message })
    }
}

export const saveUser = async (req, res) => {
    if (!req.body.name) return res.json({ msg: "Name is required." });
    if (!req.body.password) return res.json({ msg: "Password is required." });
    if (!req.body.age) return res.json({ msg: "Age is required." });
    if (!req.body.nationality) return res.json({ msg: "Nationality is required." });

    const name = req.body.name;
    const password = req.body.password;
    const age = req.body.age;
    const nationality = req.body.nationality;
    const url = req.body.url;

    try {
        await Users.create({ name: name, age: age, nationality: nationality, url: url, password: password });
        res.json({ msg: "The user was added successfully." });
    } catch (err) {
        res.json({ msg: err.message })
    }
}

export const updateUser = async (req, res) => {

    const user = await Users.findOne({
        where: {
            id: req.params.id
        }
    });
    if (!user) return res.json({ msg: "The user was not found." });

    let name = ""
    let password = ""
    let age = ""
    let nationality = ""
    let url = ""

    if (req.body.name == "") {
        name = user.name
    } else {
        name = req.body.name;
    }

    if (req.body.password == "") {
        password = user.password
    } else {
        password = req.body.password;
    }

    if (req.body.age == "") {
        age = user.age
    } else {
        age = req.body.age;
    }

    if (req.body.nationality == "") {
        nationality = user.nationality
    } else {
        nationality = req.body.nationality;
    }

    if (req.body.url == "") {
        url = user.url
    } else {
        url = req.body.url;
    }

    try {
        await Users.update({ name: name, age: age, nationality: nationality, url: url, password: password }, {
            where: {
                id: req.params.id
            }
        });
        res.json({ msg: "The user was update successfully." });
    } catch (err) {
        res.json({ msg: err.message })
    }
}

export const deleteUser = async (req, res) => {

    const response = await Users.findOne({
        where: {
            id: req.params.id
        }
    });

    if (!response) return res.json({ msg: "The user was not found." });

    try {
        await Users.destroy({
            where: {
                id: req.params.id
            }
        });
        res.json({ msg: "The user was delete successfully ." });
    } catch (error) {
        res.json({ msgd: error.message });;
    }
}

