const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../lib/prisma");

const registerSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const register = async (req, res) => {
    try {
        // 1. Validate incoming data
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid input",
                errors: result.error.issues,
            });
        }

        const { name, email, password } = result.data;

        // 2. Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered",
            });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // 5. Send response
        return res.status(201).json({
            message: "Registration successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(1, "Password is required"),
});

const login = async (req, res) => {
    try {
        // 1. Validate input
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                message: "Invalid input",
                errors: result.error.issues,
            });
        }

        const { email, password } = result.data;

        // 2. Find user
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // 3. Compare password
        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // 4. Create JWT
        const token = jwt.sign(
            {
                userId: user.id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        // 5. Send response
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
};

module.exports = {
    register,
    login,
};