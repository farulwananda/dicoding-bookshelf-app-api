const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;
  const id = nanoid(16);
  // default buku
  let finished = false;
  // kriteria jika buku selesai dibaca
  if (pageCount === readPage) {
    finished = true;
  }

  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  // kriteria jika client tidak melampirkan properti name
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  // kriteria jika client melampirkan halaman yang telah dibaca melebihi jumlah halaman buku
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;
  // jika buku berhasil ditambahkan
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  // jika terjadi generic error
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => {
  const {
    name,
    reading,
    finished,
  } = request.query;

  // menampilkan keseluruhan buku
  const filterAll = name === undefined && reading === undefined && finished === undefined;
  if (filterAll) {
    const response = h.response({
      status: 'success',
      data: {
        books: books.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });
    response.code(200);
    return response;
  }

  // non-case sensitive untuk name
  if (name) {
    // eslint-disable-next-line max-len
    const filterBookName = books.filter((book) => book.name.toLowerCase().indexOf(name.toLowerCase()) > -1);
    const response = h.response({
      status: 'success',
      data: {
        books: filterBookName.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });

    response.code(200);
    return response;
  }

  // query parameter untuk reading
  if (reading) {
    const filterBookReading = books.filter(
      (book) => Number(book.reading) === Number(reading),
    );

    const response = h.response({
      status: 'success',
      data: {
        books: filterBookReading.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });

    response.code(200);
    return response;
  }

  // query parameter untuk finished
  if (finished) {
    const filterBookFinished = books.filter(
      (book) => Number(book.finished) === Number(finished),
    );

    const response = h.response({
      status: 'success',
      data: {
        books: filterBookFinished.map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        })),
      },
    });

    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const book = books.filter((n) => n.id === bookId)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  // jika id buku tidak ada
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  // kriteria jika client tidak melampirkan properti name
  if (name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }
  // kriteria jika client melampirkan halaman yang telah dibaca melebihi jumlah halaman buku
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  // jika pageCount sama dengan readPage maka buku telah selesai dibaca
  let finished = false;
  if (pageCount === readPage) {
    finished = true;
  }
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      finished,
      reading,
      insertedAt,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });

    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;
  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
