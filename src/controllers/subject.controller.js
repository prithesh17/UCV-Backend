import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Subject } from '../models/subject.model.js'
import { Attendence } from '../models/attendance.model.js'
import { Student } from '../models/student.model.js'
import { Marks } from '../models/marks.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { File } from '../models/file.model.js'

const loginSubject = asyncHandler(async (req, res) => {
    const { subjectCode, password } = req.body
    if (!subjectCode && !password) {
        throw new ApiError(400, " and Password is required")
    }

    const subject = await Subject.findOne({ subjectCode })
    if (!subject) {
        throw new ApiError(404, "Subject does not exist")
    }

    const isPasswordValid = await subject.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Subject credentials")
    }

    const accessToken = subject.generateAccessToken()
    const loggedInSubject = await Subject.findById(subject._id).select("-password")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInSubject, accessToken
                },
                "User logged In Successfully"
            )
        )

})

const studentList = asyncHandler(async (req, res) => {
    const subjectId = req.user._id;
    try {
        const subject = await Subject.findById(subjectId);

        if (!subject) {
            throw new ApiError(404, 'Subject not found');
        }

        const adminId = subject.adminId;
        const students = await Student.find({ adminId });
        res.status(200).json(new ApiResponse(200, students, 'Student list fetched successfully'));

    } catch (error) {
        throw new ApiError(500, 'Failed to fetch student list');
    }
})

const updateAttendence = asyncHandler(async (req, res) => {
    const { studentId, date, isPresent } = req.body;
    const subjectId = req.user._id;

    const formattedDate = new Date(date);

    if (!studentId || !formattedDate || isPresent === undefined) {
        throw new ApiError(400, "studentId, date, and isPresent are required");
    }

    try {
        const updatedAttendance = await Attendence.findOneAndUpdate(
            { studentId, subjectId, date: formattedDate },
            { isPresent }, 
            { new: true, upsert: true } 
        );

        return res.status(200).json(
            new ApiResponse(
                200,
                { updatedAttendance },
                "Attendance updated successfully"
            )
        );
    } catch (error) {
        console.error("Error updating attendance:", error);
        throw new ApiError(500, "Failed to update attendance record");
    }
});

const updateMarks = asyncHandler(async (req, res) => {
    const { studentId, testType, maxMarks, scoredMarks } = req.body;
    const subjectId = req.user._id;

    if (!studentId || !testType || maxMarks === undefined || scoredMarks === undefined) {
        throw new ApiError(400, "studentId, testType, maxMarks, and scoredMarks are required");
    }

    if (!['IA1', 'IA2', 'IA3'].includes(testType)) {
        throw new ApiError(400, "Invalid testType. Allowed values are 'IA1', 'IA2', 'IA3'");
    }

    try {
        let marks = await Marks.findOne({ studentId, subjectId, testType });

        if (marks) {
            marks.maxMarks = maxMarks;
            marks.scoredMarks = scoredMarks;
        } else {
            marks = new Marks({
                studentId,
                subjectId,
                testType,
                maxMarks,
                scoredMarks
            });
        }

        await marks.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                { marks },
                marks ? "Marks updated successfully" : "Marks created successfully"
            )
        );
    } catch (error) {
        console.error("Error updating marks:", error);
        throw new ApiError(500, "Failed to update or create marks record");
    }
})

const uploadPDF = asyncHandler(async (req, res) => {

    const { fileName } = req.body;

    if (!fileName) {
        throw new ApiError(400, "File name is required");
    }

    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    try {
        const localFilePath = req.file.path;

        const uploadResult = await uploadOnCloudinary(localFilePath);

        if (!uploadResult) {
            return res.status(500).json({ message: "Failed to upload file to Cloudinary" });
        }

        const newFile = new File({
            adminId: req.user._id,
            fileName: fileName,
            url: uploadResult.url,
        });

        await newFile.save();


        res.status(201).json({
            message: "PDF uploaded successfully",
        });
    } catch (error) {
        console.error("Error uploading PDF:", error);
        res.status(500).json({ message: "Error uploading PDF" });
    }
});

export {
    loginSubject,
    updateAttendence,
    updateMarks,
    studentList,
    uploadPDF
}