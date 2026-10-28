const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  ATELIER ACCESSORIES - FASHION E-COMMERCE PLATFORM    `);
  console.log(`  Server running at: http://localhost:${PORT}          `);
  console.log(`  RESTful API at:    http://localhost:${PORT}/api      `);
  console.log(`  Admin Dashboard:   http://localhost:${PORT}/admin    `);
  console.log(`  Environment:       ${process.env.NODE_ENV || 'development'} `);
  console.log(`=======================================================`);
});
