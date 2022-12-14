const User = require("../models/User");
const bcrypt = require("bcryptjs");

module.exports = class AuthController {
    static async login(req, res) {
        res.render("auth/login");
    }

    static async loginPost(req, res) {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email: email } })

        if (!user) {
            req.flash('message', 'Usuário não encontrado!')
            res.render('auth/login')
            return
        }
        const passwordMatch = bcrypt.compareSync(password, user.password)

        if (!passwordMatch) {
            req.flash('message', 'Senha inválida!')
            res.render('auth/login')
            return
        }

        req.session.userid = user.id;
        req.flash("message", "Autenticação realizada com sucesso!");
        req.session.save(() => {
            res.redirect('/')
        })
    }

    static async register(req, res) {
        res.render("auth/register");
    }

    static async registerPost(req, res) {
        let { name, email, password, confirmPassword } = req.body;
        const checkIfUserExists = await User.findOne({ where: { email: email } });
        if (checkIfUserExists) {
            req.flash("message", "Email já está em uso!");
            res.render("auth/register");
            return;
        }

        // Remover os espaços em branco antes e depois
        name = name.trim();
        email = email.trim();

        // Verificar se o campo nome está vazio
        if (name == "" || typeof name == undefined || typeof name == null) {
            req.flash("message", "Campo nome não pode ser vazio!");
            res.render("auth/register");
            return;
        }

        // Limpar o nome de caracteres especiais(Apenas letras)
        name = name.replace(/[^A-zÀ-ú\s]/gi, "");

        // name match validation
        let nameFormat =
            /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u;

        if (!nameFormat.test(name)) {
            req.flash("message", "Nome Inválido!");
            res.render("auth/register");
            return;
        }

        // Verificar se o campo email está vazio
        if (email == "" || typeof email == undefined || typeof email == null) {
            req.flash("message", "Campo email não pode ser vazio!");
            res.render("auth/register");
            return;
        }

        // email match validation
        let mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!email.match(mailFormat)) {
            req.flash("message", "Endereço de E-mail inválido!");
            res.render("auth/register");
            return;
        }

        // password match validation
        if (password != confirmPassword) {
            req.flash("message", "As senha não conferem!");
            res.render("auth/register");
            return;
        }

        let passwordFormat = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (!password.match(passwordFormat)) {
            req.flash(
                "message",
                "Crie uma senha de no mínimo oito caracteres, pelo menos uma letra e um número"
            );
            res.render("auth/register");
            return;
        }

        // create a password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const user = {
            name,
            email,
            password: hashedPassword,
        };

        try {
            const createdUser = await User.create(user);

            // initialize session
            req.session.userid = createdUser.id;

            req.flash("message", "Cadastro realizado com sucesso");

            req.session.save(() => {
                res.redirect("/");
            });
        } catch (err) {
            console.log(err);
        }
    }
    static logout(req, res) {
        req.session.destroy()
        res.redirect('/login')
    }
};
