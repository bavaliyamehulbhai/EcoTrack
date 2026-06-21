const request = require('supertest');
const express = require('express');

const app = express();
app.get('/api/goals', (req, res) => res.status(200).json([]));

describe('GET /api/goals', () => {
  it('should return 200', async () => {
    const res = await request(app).get('/api/goals');
    expect(res.statusCode).toBe(200);
  });
});
