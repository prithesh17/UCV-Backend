import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Admin } from '../models/admin.model.js'
import { Student } from '../models/student.model.js'
import { Subject } from '../models/subject.model.js'
import { sendEmail } from "../utils/emailSender.js";
import { createAccountEmail } from '../utils/emailContent.js'

const registerAdmin = asyncHandler(async (req, res) => {

    const { fullName, email, password } = req.body

    if (
        [fullName, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await Admin.findOne({ email })
    if (existedUser) {
        throw new ApiError(409, "Admin with email already exists")
    }

    const newAdmin = await Admin.create({
        fullName,
        email,
        password,
    })

    const createdUser = await Admin.findById(newAdmin._id).select(
        "-password"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the Admin")
    }

    const emailSubject = "Welcome to Undergrad Cohesion Virtue!";
    const emailText = createAccountEmail(fullName, email, password);

    try {
        sendEmail(email, emailSubject, emailText);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new ApiError(500, "Admin created, but failed to send email");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email && !password) {
        throw new ApiError(400, "Email and Password is required")
    }

    const admin = await Admin.findOne({ email })
    if (!admin) {
        throw new ApiError(404, "Admin does not exist")
    }

    const isPasswordValid = await admin.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const accessToken = admin.generateAccessToken()
    const loggedInUser = await Admin.findById(admin._id).select("-password")

    const options = {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 60 * 1000)
    }

    res.cookie('accessToken', accessToken, options);
    res.status(200).json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken
            },
            "User logged In Successfully"
        )
    )
})


const createStudent = asyncHandler(async (req, res) => {
    const adminId = req.user._id;
    const { fullName, usn, email, password } = req.body;

    const existingStudent = await Student.findOne({ email });

    if (existingStudent) {
        throw new ApiError(409, 'Student with this email already exists');
    }

    const newStudent = await Student.create({
        adminId,
        fullName,
        usn,
        email,
        password,
    });

    const createdStudent = await Student.findById(newStudent._id).select(
        "-password"
    );

    if (!createdStudent) {
        throw new ApiError(500, "Something went wrong while registering the Student");
    }

    const emailSubject = "Welcome to Undergrad Cohesion Virtue!";
    const emailText = createAccountEmail(fullName, email, password);

    try {
        sendEmail(email, emailSubject, emailText);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new ApiError(500, "Student created, but failed to send email");
    }

    res.status(201).json(new ApiResponse(201, createdStudent, 'Student created successfully'));
});

const createSubject = asyncHandler(async (req, res) => {

    const adminId = req.user._id;
    const { subjectName, subjectCode, facultyName, email, password } = req.body;

    const existingSubject = await Subject.findOne({ subjectCode });

    if (existingSubject) {
        throw new ApiError(409, 'Subject with this Subject Code already exists');
    }

    const newSubject = await Subject.create({
        adminId,
        subjectName,
        subjectCode,
        facultyName,
        email,
        password,
    });

    const createdSubject = await Subject.findById(newSubject._id).select(
        "-password"
    )

    if (!createdSubject) {
        throw new ApiError(500, "Something went wrong while registering the Subject")
    }

    const emailSubject = "Welcome to Undergrad Cohesion Virtue!";
    const emailText = createAccountEmail(facultyName, subjectCode, password);

    try {
        sendEmail(email, emailSubject, emailText);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new ApiError(500, "Student created, but failed to send email");
    }

    res.status(201).json(new ApiResponse(200, createdSubject, 'Subject created successfully'));

})

const listStudentsAndSubjects = asyncHandler(async (req, res) => {
    try {
        const adminId = req.user._id;
        const students = await Student.find({ adminId: adminId }).select('fullName email');

        const subjects = await Subject.find({ adminId: adminId }).select('subjectName subjectCode');

        res.status(200).json({
            statusCode: 200,
            data: {
                students: students,
                subjects: subjects,
            },
            message: "Students and subjects fetched successfully",
            success: true
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ statusCode: 500, message: "Internal server error" });
    }
});

const removeStudent = asyncHandler(async (req, res) => {
    const { id } = req.body; 

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
        return res.status(404).json({
            statusCode: 404,
            message: "Student not found",
            success: false
        });
    }

    return res.status(200).json({
        statusCode: 200,
        message: "Student removed successfully",
        success: true,
        data: student 
    });
});

const removeSubject = asyncHandler(async (req, res) => {
    const { id } = req.body; 

    const subject = await Subject.findByIdAndDelete(id);

    if (!subject) {
        return res.status(404).json({
            statusCode: 404,
            message: "Subject not found",
            success: false
        });
    }

    return res.status(200).json({
        statusCode: 200,
        message: "Subject removed successfully",
        success: true,
        data: subject 
    });
});




export { registerAdmin, createStudent, createSubject, loginAdmin, listStudentsAndSubjects, removeStudent, removeSubject }