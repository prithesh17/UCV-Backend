import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Subject } from '../models/subject.model.js'
import { Student } from '../models/student.model.js'
import {Attendence} from '../models/attendance.model.js'
import { Marks } from '../models/marks.model.js'

const loginStudent = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if (!email && !password) {
        throw new ApiError(400, "Email and Password is required")
    }

    const student = await Student.findOne({ email })
    if (!student) {
        throw new ApiError(404, "Student does not exist")
    }

    const isPasswordValid = await student.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const accessToken = student.generateAccessToken()
    const loggedInUser = await Student.findById(student._id).select("-password")

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
                    user: loggedInUser, accessToken
                },
                "User logged In Successfully"
            )
        )

})

const viewAttendence = asyncHandler(async (req, res) => {
    const studentId = req.user._id; 
    const { subjectCode } = req.body;

    if (!subjectCode) {
        throw new ApiError(400, "Subject code is required");
    }

    try {
        const subject = await Subject.findOne({ subjectCode });

        if (!subject) {
            throw new ApiError(404, "Subject not found");
        }

        const subjectId = subject._id;
        const attendanceRecords = await Attendence.find({ studentId, subjectId });
        if (!attendanceRecords.length) {
            throw new ApiError(404, "No attendance records found for the given subject");
        }
        return res.status(200).json(
            new ApiResponse(
                200,
                { attendanceRecords },
                "Attendance records retrieved successfully"
            )
        );
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        throw new ApiError(500, "Failed to retrieve attendance records");
    }
})

const subjectList = asyncHandler(async (req, res) => {
    const studentId = req.user._id;
    try {
        const student = await Student.findById(studentId);

        if (!student) {
            throw new ApiError(404, 'Student not found');
        }

        const adminId = student.adminId;
        const subjects = await Subject.find({ adminId });
        res.status(200).json(new ApiResponse(200, subjects, 'Subject list fetched successfully'));

    } catch (error) {
        throw new ApiError(500, 'Failed to fetch subject list');
    }
})

const viewMarks = asyncHandler(async (req, res) => {
     const studentId = req.user._id; 
    const { subjectCode } = req.body; 

    if (!subjectCode) {
        throw new ApiError(400, "Subject code is required");
    }

    try {
        const subject = await Subject.findOne({ subjectCode });

        if (!subject) {
            throw new ApiError(404, "Subject not found");
        }

        const subjectId = subject._id;

        const marksRecords = await Marks.find({ studentId, subjectId });

        if (!marksRecords.length) {
            throw new ApiError(404, "No marks records found for the given subject");
        }

        return res.status(200).json(
            new ApiResponse(
                200,
                { marksRecords },
                "Marks records retrieved successfully"
            )
        );
    } catch (error) {
        console.error('Error fetching marks records:', error);
        throw new ApiError(500, "Failed to retrieve marks records");
    }
   
})

const viewPDFs = asyncHandler(async (req, res) => {
    const email = req.user.email;

    try {
        const student = await Student.findOne({ email });

        if (!student) {
            throw new ApiError(404, "Student not found");
        }

        const adminId = student.adminId;

        const files = await File.find({ adminId });

        const fileList = files.map(file => ({
            fileName: file.fileName,
            fileId: file._id,
        }));

        res.status(200).json({
            message: "PDFs retrieved successfully",
            files: fileList,
        });
    } catch (error) {
        console.error("Error fetching PDFs:", error);
        throw new ApiError(500, "Error fetching PDFs");
    }
});

const downloadPDF = asyncHandler(async (req, res) => {
    const { fileId } = req.params;

    try {
        const file = await File.findById(fileId);

        if (!file) {
            throw new ApiError(404, "File not found");
        }

        res.status(200).json({
            message: "File URL retrieved successfully",
            url: file.url,
        });
    } catch (error) {
        console.error("Error retrieving file URL:", error);
        throw new ApiError(500, "Error retrieving file URL");
    }
});

export {
    loginStudent,
    viewAttendence,
    viewMarks,
    subjectList,
    viewPDFs,
    downloadPDF
}