 .cards-container {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      margin-top: 15px;
    }

    .card {
      background-color: #b0e57c;
      border-radius: 12px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      padding: 10px;
      width: 120px;
      text-align: center;
      transition: 0.3s;
    }

    .card:hover {
      transform: scale(1.05);
      background-color: #a6df72;
    }

    .card h4 {
      margin: 5px 0;
      font-size: 1em;
      color: #2f4f2f;
    }

    .card .score {
      font-size: 1.5em;
      font-weight: bold;
      color: #2f4f2f;
    }

    .total-card {
      background-color: #9cd37a;
      width: 250px;
    }

    /* === Sección de Tops === */
    .tops-section {
      margin-top: 25px;
      text-align: center;
    }

    select {
      padding: 8px;
      border-radius: 8px;
      border: 1px solid #8ab96f;
      width: 85%;
      font-size: 1em;
      background-color: #f6fff1;
      margin-top: 10px;
    }

    .top-list {
      margin-top: 10px;
      background-color: #b0e57c;
      border-radius: 10px;
      padding: 10px;
      max-height: 200px;
      overflow-y: auto;
      text-align: left;
      font-size: 0.9em;
    }

    .top-item {
      padding: 5px;
      border-bottom: 1px solid #8ab96f;
    }

    .top-item:last-child {
      border-bottom: none;
    }

    @media (max-width: 400px) {
      .card {
        width: 100%;
      }

      .total-card {
        width: 100%;
      }
    }