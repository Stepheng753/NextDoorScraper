# NextDoorScraper

This project demonstrates how to use [Playwright](https://playwright.dev/) for scraping posts from Nextdoor. It includes Playwright test configuration, example tests, and a sample script for extracting post data from the Nextdoor website.

## Prerequisites

-   [Node.js](https://nodejs.org/) (v16+ recommended)
-   [npm](https://www.npmjs.com/)

## Setup

1.  **Install dependencies:**

    ```sh
    npm install
    ```

2.  **Install Playwright browsers:**

    ```sh
    npx playwright install
    ```

3.  **Running Playwright Tests:**

    You can run the Playwright tests using the following command:

    ```sh
    npx playwright test
    ```

    Test results and reports will be generated in the `playwright-report/` directory

4.  **Scraping Nextdoor Posts:**

    The script `nextDoorScraper.js` contains a function to extract post data from a Nextdoor feed page. This script is intended to be run in the browser console on a Nextdoor page after logging in.

    Usage

        1. Log in to Nextdoor in your browser and navigate to the feed or posts page you want to scrape.
        2. Open the browser's Developer Tools (usually F12 or right-click → Inspect).
        3. Copy the contents of nextDoorScraper.js and paste it into the Console tab.
        4. Run the function:

    ```javascript
    extractPostData();
    ```

        5. The script will log extracted post information (name, text, location, time, and profile link) to the console.

    Example Output

    ```
    John Doe : Lost dog near the park
    Greenwood : 2 hours ago
    https://nextdoor.com/profile/...
    ```

## Notes

-   This script is for educational purposes. Scraping websites may violate their terms of service—use responsibly.
-   For automated scraping, you can adapt the logic in nextDoorScraper.js to a Playwright script and run it headlessly.
