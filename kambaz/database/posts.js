export default [
    // RS101 Posts
    {
        id: "P1",
        courseId: "RS101",
        type: "question",           // "question" | "note"
        visibility: "entire_class", // "entire_class" | "instructors" | "individual"
        visibleTo: [],              // array of userIds, only used when visibility = "individual"
        folderIds: ["RS101F1"],          // at least one required
        summary: "When is the midterm?",   // max 100 chars, required
        details: "I want to know when the midterm is, so I know when to start studying.", // required
        authorId: "123",
        answered: true,
        viewCount: 5,
        createdAt: "2026-03-31T10:00:00Z",
        updatedAt: "2026-03-31T10:00:00Z",

        studentAnswers: [
            {
                id: "P1SA1",
                authorId: "234",
                content: "The professor said it will be in the week of April 20th.",
                createdAt: "2026-03-31T11:00:00Z",
                updatedAt: "2026-03-31T11:00:00Z"
            }
        ],

        instructorAnswers: [
            {
                id: "P1IA1",
                authorId: "678",
                content: "The midterm will be on April 22nd during class time.",
                createdAt: "2026-03-31T12:00:00Z",
                updatedAt: "2026-03-31T12:00:00Z"
            }
        ],

        followUpDiscussions: [
            {
                id: "P1IA1FU1",
                authorId: "234",
                parentId: "P1IA1",
                content: "Do we get a study sheet?",
                resolved: true,
                createdAt: "2026-03-31T13:00:00Z",
                updatedAt: "2026-03-31T13:00:00Z",
                replies: [
                    {
                        id: "P1IA1FU1R1",
                        authorId: "678",
                        content: "Yes, you get one, two-sided sheet.",
                        createdAt: "2026-03-31T13:05:00Z",
                        updatedAt: "2026-03-31T13:05:00Z",
                        replies: [
                            {
                                id: "P1IA1FU1R2",
                                authorId: "234",
                                content: "Ok, thank you!",
                                createdAt: "2026-03-31T13:10:00Z",
                                updatedAt: "2026-03-31T13:10:00Z",
                                replies: []
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: "P2",
        courseId: "RS101",
        type: "question",
        visibility: "entire_class",
        visibleTo: [],
        folderIds: ["RS101F2"], 
        summary: "HW3 clarification",
        details: "Are we supposed to submit the code as a single file?",
        authorId: "234",
        answered: false,
        viewCount: 0,
        createdAt: "2026-03-31T10:00:00Z",
        updatedAt: "2026-03-31T10:00:00Z",

        studentAnswers: [],

        instructorAnswers: [],

        followUpDiscussions: []
    },
    {
        id: "P3",
        courseId: "RS101",
        type: "note",
        visibility: "entire_class", 
        visibleTo: [],
        folderIds: ["RS101F3"],
        summary: "Office hours 4/6",
        details: "My office hours are being moved to 12PM-3PM EST today.",
        authorId: "345",
        // no "answered", as this is a note and "answered" is not required
        viewCount: 2,
        createdAt: "2026-03-31T10:00:00Z",
        updatedAt: "2026-03-31T10:00:00Z",

        studentAnswers: [],

        instructorAnswers: [
            {
                id: "P3IA1",
                authorId: "678",
                content: "Here is the Zoom link: (Mock URL)",
                createdAt: "2026-03-31T12:00:00Z",
                updatedAt: "2026-03-31T12:00:00Z"
            }
        ],

        followUpDiscussions: []
    },
    {
        id: "P4",
        courseId: "RS101",
        type: "question",
        visibility: "instructors",
        visibleTo: [],
        folderIds: ["RS101F4"],
        summary: "Group project trouble",
        details: "One of my group members for the final project isn't responding, what should I do?",
        authorId: "456",
        answered: true,
        viewCount: 5,
        createdAt: "2026-03-31T10:00:00Z",
        updatedAt: "2026-03-31T10:00:00Z",

        studentAnswers: [],

        instructorAnswers: [
            {
                id: "P4IA1",
                authorId: "789",
                content: "I will reach out to them.",
                createdAt: "2026-03-31T12:00:00Z",
                updatedAt: "2026-03-31T12:00:00Z"
            }
        ],

        followUpDiscussions: [
            {
                id: "P4IA1FU1",
                authorId: "456",
                parentId: "P4IA1",
                content: "Thanks. I appreciate it.",
                resolved: true,
                createdAt: "2026-03-31T13:00:00Z",
                updatedAt: "2026-03-31T13:00:00Z",
                replies: []
            }
        ]
    },
    {
        id: "P6",
        courseId: "RS101",
        type: "question",
        visibility: "individual",
        visibleTo: [123], // only visible to user with id "123"
        folderIds: ["RS101F2"], 
        summary: "Secret post",
        details: "iron_man, can you see this post?",
        authorId: "234",
        answered: false,
        viewCount: 0,
        createdAt: "2026-03-31T10:00:00Z",
        updatedAt: "2026-03-31T10:00:00Z",

        studentAnswers: [],

        instructorAnswers: [],

        followUpDiscussions: []
    },

    // RS102 posts
    {
        id: "P5",
        courseId: "RS102",
        type: "question",
        visibility: "entire_class",
        visibleTo: [],
        folderIds: ["RS102F1"],
        summary: "3/25 Lecture slides", 
        details: "When will the slides for the 3/35 lecture be posted?",
        authorId: "234",
        answered: true,
        viewCount: 5,
        createdAt: "2026-03-31T10:00:00Z",
        updatedAt: "2026-03-31T10:00:00Z",

        studentAnswers: [
            {
                id: "P5SA1",
                authorId: "234",
                content: "They just got posted.",
                createdAt: "2026-03-31T11:00:00Z",
                updatedAt: "2026-03-31T11:00:00Z"
            }
        ],

        instructorAnswers: [
            {
                id: "P5IA1",
                authorId: "789",
                content: "They will be posted in a few minutes.",
                createdAt: "2026-03-31T12:00:00Z",
                updatedAt: "2026-03-31T12:00:00Z"
            }
        ],

        followUpDiscussions: [
            {
                id: "P5IA1FU1",
                authorId: "234",
                parentId: "P5IA1",
                content: "Just saw them. Thank you.",
                resolved: true,
                createdAt: "2026-03-31T13:00:00Z",
                updatedAt: "2026-03-31T13:00:00Z",
                replies: []
            }
        ]
    },
]