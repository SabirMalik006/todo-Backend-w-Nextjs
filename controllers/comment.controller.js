const Todo = require("../models/todoModels");


exports.addComment = async (req, res) => {
    try {
        const { todoId } = req.params;
        const { text } = req.body;
        const userId = req.userId;

        const todo = await Todo.findById(todoId);
        if (!todo) return res.status(404).json({ message: "Todo not found" });

        const comment = { text, user: userId };
        todo.comments.push(comment);
        await todo.save();

        const populatedTodo = await Todo.findById(todoId)
            .populate("comments.user", "name email");

        const newComment =
            populatedTodo.comments[populatedTodo.comments.length - 1];

        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



exports.getComments = async (req, res) => {
    try {
        const { todoId } = req.params;
        const todo = await Todo.findById(todoId).populate("comments.user", "name email");
        if (!todo) return res.status(404).json({ message: "Todo not found" });

        res.json(todo.comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const { todoId, commentId } = req.params;
        const { text } = req.body;
        const userId = req.userId;

        const todo = await Todo.findById(todoId);
        if (!todo) return res.status(404).json({ message: "Todo not found" });

        const comment = todo.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found" });

        if (comment.user.toString() !== userId)
            return res.status(403).json({ message: "Not authorized" });

        comment.text = text;
        await todo.save();


        const updatedTodo = await Todo.findById(todoId)
            .populate("comments.user", "name email");

        const updatedComment = updatedTodo.comments.id(commentId);

        res.json(updatedComment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



exports.deleteComment = async (req, res) => {
    try {
        const { todoId, commentId } = req.params;

        const todo = await Todo.findById(todoId);
        if (!todo) return res.status(404).json({ message: "Todo not found" });

        const comment = todo.comments.id(commentId);
        if (!comment)
            return res.status(404).json({ message: "Comment not found" });

        if (String(comment.user) !== req.userId)
            return res.status(403).json({ message: "Not allowed" });

        comment.deleteOne();
        await todo.save();

        res.json({ message: "Comment deleted" });
    } catch (err) {
        console.error("Delete Comment Error:", err);
        res.status(500).json({ message: "Failed to delete comment" });
    }
};
