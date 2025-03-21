const swaggerAutogen = require('swagger-autogen')(); // Thiếu () ở dòng đầu

const doc = {
    info: {
        title: 'NettromDex API docs',
        version: '1.0.0',
    },
    host: 'https://api-manga-user.vercel.app',
    schemes: ['https'],
};

const outputFile = '../swagger_output.json'; // Nên là JSON chứ không phải JS
const endpointsFiles = [ // Đổi tên biến đúng chuẩn
    './followRoutes.js',
    './historyRoutes.js',
    './userRoutes.js',
    '../app.js'
];

swaggerAutogen(outputFile, endpointsFiles, doc);