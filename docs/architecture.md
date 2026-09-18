# Student OS Architecture

```text
Student
   |
   v
Frontend
   |
   v
FastAPI Backend
   |
   +-------------------+
   |                   |
   v                   v
AI Agent           PostgreSQL
   |                   |
   +--------+----------+
            |
            v
      Student Context
            |
   +--------+---------+
   |        |         |
   v        v         v
Creators Resources   Jobs
   |        |         |
   +--------+---------+
            |
            v
      AI Gap Analysis
            |
            v
     Personalized Roadmap
            |
            v
       Next Action
            |
            v
        Progress
            |
            v
       Agent Memory
```
