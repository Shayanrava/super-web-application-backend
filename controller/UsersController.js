import db from "../config/DB.js";

export const getUsers = async (req, res) => {
    try {
        const selectQuery = `
            SELECT * 
            FROM users
        `;
        const response = await db.query(selectQuery);
        res.status(200).json(response.rows);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}

export const getUserByUsernamePassword = async (req, res) => {
    try {
        const selectQuery = `
            SELECT * 
            FROM users
            WHERE username = $1 AND password = $2
        `;
        // جلوگیری کامل از SQL Injection با پاس دادن پارامترها به صورت آرایه
        const userResult = await db.query(selectQuery, [req.body.user_name, req.body.password]);
        
        if(userResult.rows.length === 0) return res.status(404).json({msg:"The user not found ."});
        res.status(200).json(userResult.rows[0]);
    } catch (error) {
        res.status(500).json({msg:error.message});
    }
}

export const getSingleUser = async (req, res) => {
    try {
        const selectQuery = `
            SELECT * 
            FROM users
            WHERE id = $1
        `;
        const response = await db.query(selectQuery, [req.params.id]);
        if (response.rows.length === 0) return res.status(404).json({ msg: "User not found ." });
        res.status(200).json(response.rows[0]);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}


export const saveUser = async (req, res) => {
    if (!req.body) return res.status(400).json({ msg: "Please send some information about yourself ." })
    if (!req.body.user_name) return res.status(400).json({ msg: "Username is required." });
    if (!req.body.password) return res.status(400).json({ msg: "Password is required." });
    if (!req.body.birth_date) return res.status(400).json({ msg: "Birth date is required." });
    if (!req.body.nationality) return res.status(400).json({ msg: "Nationality is required." });
    if (!req.body.email) return res.status(400).json({ msg: "Email is required." });
    
    const user_name = req.body.user_name;
    const password = req.body.password;
    const birth_date = req.body.birth_date;
    const email = req.body.email;
    const nationality = req.body.nationality;
    const url = req.body.url ? req.body.url : null;

    try {
        const checkEmailQuery = `
            SELECT * 
            FROM users
            WHERE email = $1
        `;
        const checkEmail = await db.query(checkEmailQuery, [email]);
        if (checkEmail.rows.length > 0) return res.status(409).json({ msg: "An account with this email already exists." });

        const checkUsernameQuery = `
            SELECT * 
            FROM users
            WHERE username = $1
        `;
        const checkUsername = await db.query(checkUsernameQuery, [user_name]);
        if (checkUsername.rows.length > 0) return res.status(409).json({ msg: "This username is already taken." });

        const insertQuery = `
            INSERT INTO users (username, password, birth_date, email, nationality , url)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await db.query(insertQuery, [user_name, password, birth_date, email, nationality, url]);
        res.status(201).json({ msg: "The user was added successfully." });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}

export const updateUser = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ msg: "Please send some information about yourself." });
        
        if (req.body.user_name) {
            const checkUsernameQuery = `
                SELECT * 
                FROM users
                WHERE username = $1 AND id != $2
            `;
            const checkUsername = await db.query(checkUsernameQuery, [req.body.user_name, req.params.id]);
            if (checkUsername.rows.length > 0) return res.status(409).json({ msg: "This username is already taken." });
        }
        
        const selectQuery = `
            SELECT * 
            FROM users
            WHERE id = $1
        `;
        const userResult = await db.query(selectQuery, [req.params.id]);
        if (userResult.rows.length === 0) return res.status(404).json({ msg: "The user was not found." });
        
        const currentUser = userResult.rows[0];
        const user_name = req.body.user_name !== undefined ? req.body.user_name : currentUser.username;
        const password = req.body.password !== undefined ? req.body.password : currentUser.password;
        
        // اگر تاریخ به شکل آبجکت Date برگشته باشد، به فرمت رشته‌ای تبدیلش می‌کنیم
        let currentBirthDate = currentUser.birth_date;
        if (currentBirthDate instanceof Date) {
            currentBirthDate = currentBirthDate.toISOString().split('T')[0];
        }
        const birth_date = req.body.birth_date !== undefined ? req.body.birth_date : currentBirthDate;
        
        const nationality = req.body.nationality !== undefined ? req.body.nationality : currentUser.nationality;
        const url = (req.body.url !== undefined ? req.body.url : (currentUser.url ? currentUser.url : null));
        
        const updateQuery = `
            UPDATE users
            SET
                username = $1,
                password = $2,
                birth_date = $3,
                nationality = $4,
                url = $5
            WHERE id = $6
        `;
        await db.query(updateQuery, [user_name, password, birth_date, nationality, url, req.params.id]);
        res.status(200).json({ msg: "The user was updated successfully." });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const selectQuery = `
            SELECT * 
            FROM users
            WHERE id = $1
        `;
        const userResult = await db.query(selectQuery, [req.params.id]);
        if (userResult.rows.length === 0) return res.status(404).json({ msg: "The user was not found." });
        
        const removeQuery = `
            DELETE FROM users 
            WHERE id = $1
        `;
        await db.query(removeQuery, [req.params.id]);
        res.status(200).json({ msg: "The user was deleted successfully ." });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
}