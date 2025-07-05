# NextDoorScraper

A Node.js script using Playwright to log in to Nextdoor, scroll and scrape posts, save them to a text file, and optionally email the results.

## Features

-   Automated login to Nextdoor
-   Scrolls to load more posts
-   Scrapes post data (name, text, location, time, link)
-   Saves results to a timestamped `.txt` file
-   Optionally emails the results as an attachment

## Setup

1. **Clone the repository**
2. **Install dependencies**
    ```sh
    npm install
    ```
3. **Create a `.env` file** in the project root:

    ```
    EMAIL_USER=your_email@gmail.com
    EMAIL_PASS=your_app_password
    NEXTDOOR_PASS=your_nextdoor_password
    TXT_FILE_PATH=nextdoor_posts.txt
    ```

    > Use an [App Password](https://support.google.com/accounts/answer/185833?hl=en) for Gmail.

4. **Configure selectors and URLs** in `nextDoorConfig.js` if needed.

## Usage

Run the scraper:

```sh
npm start
```

Or directly:

```sh
node nextDoorScraper.js
```

## Output

-   Scraped posts are saved to the file specified by `TXT_FILE_PATH` in your `.env`.
-   If enabled, an email with the results is sent to your address.

## Notes

-   This script is for educational purposes. Scraping websites may violate their terms of service.
-   Your credentials are kept safe in the `.env` file (which is gitignored).

##
