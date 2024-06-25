const createAccountEmail = (fullName, email, password) => {
    return `
    Dear ${fullName},

    Thank you for registering with Our Service! Your login credentials are as follows:
    
    - Email: ${email}
    - Password: ${password}

    We're excited to have you on board. If you have any questions or need assistance, please don't hesitate to contact us.

    Best regards,
    The Our Service Team
    `;
};

export { createAccountEmail };