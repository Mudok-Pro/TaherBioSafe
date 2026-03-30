# AshSync

## Hosting Links
- **Production Site:** [https://taherbiosafe.web.app](https://taherbiosafe.web.app)
- **Firebase Site:** [https://taherbiosafe.firebaseapp.com](https://taherbiosafe.firebaseapp.com)

## Repository Status
This project is managed within Firebase Studio. 

### How to push to GitHub (Fixed for Secrets & Size)

If your push was blocked by "GitHub Push Protection" or was too large, run these commands in order:

1. **Remove the old Git history:**
   ```bash
   rm -rf .git
   ```

2. **Start fresh (The new .gitignore will now protect your secrets):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit (clean and secure)"
   git branch -M main
   ```

3. **Link to your GitHub account:** 
   ```bash
   git remote add origin https://github.com/touahriachamsdine-oss/Taher_biosafe.git
   ```

4. **Push (Force):**
   ```bash
   git push -u origin main --force
   ```

---
*Note: Sensitive files like `serviceAccountKey.json` and `node_modules` are now excluded from the repository for security and performance.*
