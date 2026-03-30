export default function ModuleRoute(app) {
    const module = {
    id: "34",
    name: "CS4730 Distributed Systems",
    description: "This module covers the fundamentals of distributed systems, including communication, synchronization, and fault tolerance.",
    course: "Computer Science",
    }

    const assignment = {
      id: 1, name: "Paxos Protocol", description: "Implement the Paxos consensus algorithm in a distributed system.", completed: "false", score: 0,
    }

  app.get("/lab5/module/", (req, res) => {
    res.json(module);
  });
  app.get("/lab5/module/name", (req, res) => {
    res.json(module.name);
  });
  app.get("/lab5/module/name/:newName", (req, res) => {
    const { newName } = req.params;
    module.name = newName;
    res.json(module);
  });
  app.get("/lab5/module/description", (req, res) => {
    res.json(module.description);
  });
  app.get("/lab5/module/description/:newDescription", (req, res) => {
    const { newDescription } = req.params;
    module.description = newDescription;
    res.json(module);
  });
  app.get("/lab5/module/assignment", (req, res) => {
    res.json(assignment);
  });
  app.get("/lab5/module/assignment/score/:newScore", (req, res) => {
    const { newScore } = req.params;
    assignment.score = newScore;
    res.json(assignment);
  });
    app.get("/lab5/module/assignment/completed/:newCompleted", (req, res) => {
    const { newCompleted } = req.params;
    assignment.completed = newCompleted;
    res.json(assignment);
  });
}