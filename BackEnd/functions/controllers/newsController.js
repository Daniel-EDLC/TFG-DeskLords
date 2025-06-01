const News = require('../models/News');

async function createNews(req, res) {
    try {
        const newNews = new News({
            title: req.body.title,
            content: req.body.content,
            image: req.body.image,
            date: req.body.date || Date.now(),
        });

        const newsSaved = await newNews.save();

        // Usando tu formato de respuesta estándar
        req.response.success({ news: newsSaved });
    } catch (error) {
        req.response.error(`Error al crear la noticia: ${error.message}`);
    }
}

async function getNews(req, res) {
    try {
        const news = await News.find().sort({ date: -1 });
        req.response.success({ news: news });
    } catch (error) {
        req.response.error(`Error al obtener las noticias: ${error.message}`);
    }
}

async function updateNews(req, res) {
    try {
        const newsId = req.body.idNews;
        const updatedData = req.body.data;

        const updatedNews = await News.findByIdAndUpdate(newsId, updatedData, { new: true });

        if (!updatedNews) {
            return req.response.error('Noticia no encontrada');
        }

        req.response.success({ news: updatedNews });
    } catch (error) {
        req.response.error(`Error al actualizar la noticia: ${error.message}`);
    }
}

async function deleteNews(req, res) {
    try {
        const newsId = req.body.idNews;

        const deletedNews = await News.findByIdAndDelete(newsId);

        if (!deletedNews) {
            return req.response.error('Noticia no encontrada');
        }

        req.response.success({ message: 'Noticia eliminada correctamente' });
    } catch (error) {
        req.response.error(`Error al eliminar la noticia: ${error.message}`);
    }
}

module.exports = {
    createNews,
    getNews,
    updateNews,
    deleteNews
};