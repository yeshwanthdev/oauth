const rm = require("@root/rm");
const { getPasswordResetTemplate, getVerifyEmailTemplate } = require("@helper/template");

const verification = async (record) => {
    try {

        const emailService = new rm.emailService(rm.config.smtp);
        const url = `${rm.config.APP_ORIGIN}/password/reset?code=${record.code}&exp=${record.expiresAt.getTime()}`;
        const template = getVerifyEmailTemplate(url);

        const options = {
            from: 'yeshwanth2900@gmail.com',
            to: 'yeshwanth2900@gmail.com',
            ...template

        };

        await emailService.sendEmail(options);


    } catch (error) {
        console.error('Exception occured while sending notification due to - ', error);
        return false;
    }
};


const forgotPassword = async (record) => {
    try {

        const emailService = new rm.emailService(rm.config.smtp);
        const url = `${rm.config.APP_ORIGIN}/password/reset?code=${record.code}&exp=${record.expiresAt.getTime()}`;
        const template = getPasswordResetTemplate(url);

        const options = {
            from: 'yeshwanth2900@gmail.com',
            to: 'yeshwanth2900@gmail.com',
            ...template

        };

        await emailService.sendEmail(options);


    } catch (error) {
        console.error('Exception occured while sending notification due to - ', error);
        return false;
    }
}


module.exports = {
    verification, forgotPassword
}