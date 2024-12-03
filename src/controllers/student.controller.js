import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import { Subject } from '../models/subject.model.js'
import { Student } from '../models/student.model.js'
import { Attendence } from '../models/attendance.model.js'
import { Marks } from '../models/marks.model.js'
import { File } from '../models/file.model.js'

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

  try {
    const student = await Student.findById(studentId);

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    const adminId = student.adminId;

    const subjects = await Subject.find({ adminId });

    if (!subjects.length) {
      throw new ApiError(404, "No subjects found for the admin");
    }

    const attendanceData = [];

    for (const subject of subjects) {
      const subjectName = subject.subjectName;
      const subjectId = subject._id;

      const attendanceRecords = await Attendence.find({ studentId, subjectId });

      if (attendanceRecords.length) {
        const totalClasses = attendanceRecords.length;
        const attendedClasses = attendanceRecords.filter(record => record.isPresent).length;

        const attendancePercentage = ((attendedClasses / totalClasses) * 100).toFixed(2);

        attendanceData.push({
          subjectName,
          totalClasses,
          attendedClasses,
          attendancePercentage
        });
      }
    }

    if (!attendanceData.length) {
      throw new ApiError(404, "No attendance records found for the student");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        attendanceData,
        "Attendance records retrieved successfully"
      )
    );
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    throw new ApiError(500, "Failed to retrieve attendance records");
  }
});

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

  try {
    const marks = await Marks.find({ studentId })
      .populate('subjectId', 'subjectCode subjectName')
      .sort({ testType: 1 });

    if (!marks.length) {
      throw new ApiError(404, "No marks found for the student");
    }

    const marksByTest = {
      IA1: [],
      IA2: [],
      IA3: [],
    };

    marks.forEach(mark => {
      marksByTest[mark.testType].push({
        subjectCode: mark.subjectId.subjectCode,
        subjectName: mark.subjectId.subjectName,
        scoredMarks: mark.scoredMarks,
        maxMarks: mark.maxMarks,
      });
    });

    const responseData = {
      IA1: marksByTest.IA1,
      IA2: marksByTest.IA2,
      IA3: marksByTest.IA3,
    };

    return res.status(200).json(
      new ApiResponse(
        200,
        responseData,
        "Marks retrieved successfully"
      )
    );
  } catch (error) {
    console.error('Error fetching marks:', error);
    throw new ApiError(500, "Failed to retrieve marks");
  }
});


const getPDFs = asyncHandler(async (req, res) => {
  const { email } = req.user;

  try {
    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const { adminId } = student;

    const files = await File.find({ adminId }, 'fileName url createdAt');

    if (files.length === 0) {
      return res.status(404).json({ message: 'No PDFs available for download' });
    }

    res.status(200).json({ files });
  } catch (error) {
    console.error('Error fetching PDFs:', error);
    res.status(500).json({ message: 'Error fetching PDFs' });
  }
});


const getLeaderboard = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  try {
    const ia1Marks = await Marks.aggregate([
      { $match: { testType: 'IA1' } },
      { $group: { _id: '$studentId', totalMarks: { $sum: '$scoredMarks' } } },
      { $sort: { totalMarks: -1 } },
      { $limit: 3 }
    ]);

    const ia2Marks = await Marks.aggregate([
      { $match: { testType: 'IA2' } },
      { $group: { _id: '$studentId', totalMarks: { $sum: '$scoredMarks' } } },
      { $sort: { totalMarks: -1 } },
      { $limit: 3 }
    ]);

    const ia3Marks = await Marks.aggregate([
      { $match: { testType: 'IA3' } },
      { $group: { _id: '$studentId', totalMarks: { $sum: '$scoredMarks' } } },
      { $sort: { totalMarks: -1 } },
      { $limit: 3 }
    ]);

    const populateStudentNames = async (marksArray) => {
      const populatedMarks = [];
      for (let mark of marksArray) {
        const student = await Student.findById(mark._id);
        if (student) {
          populatedMarks.push({
            ...mark,
            fullName: student.fullName,
          });
        }
      }
      return populatedMarks;
    };

    const ia1MarksWithNames = await populateStudentNames(ia1Marks);
    const ia2MarksWithNames = await populateStudentNames(ia2Marks);
    const ia3MarksWithNames = await populateStudentNames(ia3Marks);

    const currentStudent = await Student.findById(studentId);
    if (!currentStudent) {
      throw new ApiError(404, "Student not found");
    }

    const getRank = (marksArray, studentId) => {
      const rank = marksArray.findIndex(item => item._id.toString() === studentId.toString()) + 1;
      return rank || 'N/A';
    };

    const getStudentMarks = (marksArray, studentId) => {
      const student = marksArray.find(item => item._id.toString() === studentId.toString());
      return student ? student.totalMarks : 0;
    };

    const ia1Rank = getRank(ia1MarksWithNames, studentId);
    const ia2Rank = getRank(ia2MarksWithNames, studentId);
    const ia3Rank = getRank(ia3MarksWithNames, studentId);

    const ia1MarksForCurrentStudent = getStudentMarks(ia1MarksWithNames, studentId);
    const ia2MarksForCurrentStudent = getStudentMarks(ia2MarksWithNames, studentId);
    const ia3MarksForCurrentStudent = getStudentMarks(ia3MarksWithNames, studentId);

    const leaderboardData = {
      IA1: ia1MarksWithNames,
      IA2: ia2MarksWithNames,
      IA3: ia3MarksWithNames,
    };

    const currentStudentData = {
      IA1Rank: ia1Rank,
      IA1Marks: ia1MarksForCurrentStudent,
      IA2Rank: ia2Rank,
      IA2Marks: ia2MarksForCurrentStudent,
      IA3Rank: ia3Rank,
      IA3Marks: ia3MarksForCurrentStudent,
    };

    return res.status(200).json(
      new ApiResponse(
        200,
        { data: leaderboardData, currentStudent: currentStudentData },
        "Leaderboard fetched successfully"
      )
    );
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw new ApiError(500, "Failed to retrieve leaderboard data");
  }
});

const getUserNameById = asyncHandler(async (req, res, next) => {
  try {
    const userId = req.user._id; 
    
    const user = await Student.findById(userId);
    
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    
    return res.status(200).json({
      success: true,
      name: user.fullName, 
    });
  } catch (error) {
    next(error); 
  }
});

export {
  loginStudent,
  viewAttendence,
  viewMarks,
  subjectList,
  getPDFs,
  getLeaderboard,
  getUserNameById
}