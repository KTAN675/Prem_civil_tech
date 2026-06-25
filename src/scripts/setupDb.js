const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const crypto = require('crypto');

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  const connectionOpts = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
  };

  const isLocal = connectionOpts.host === 'localhost' || connectionOpts.host === '127.0.0.1';
  if (!isLocal) {
    connectionOpts.ssl = {
      rejectUnauthorized: false
    };
  }

  console.log('Connecting to MySQL Server at:', connectionOpts.host, ':', connectionOpts.port);
  
  let connection;
  try {
    connection = await mysql.createConnection(connectionOpts);
    console.log('Successfully connected to MySQL server.');

    const dbName = process.env.DB_NAME || 'prem_civiltech';
    console.log(`Creating database "${dbName}" if it does not exist...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\``);
    console.log(`Using database "${dbName}".`);

    // Create users table
    console.log('Creating "users" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'editor',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create services table
    console.log('Creating "services" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(50) NOT NULL,
        order_index INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create projects table
    console.log('Creating "projects" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(50) NOT NULL,
        client VARCHAR(100) DEFAULT NULL,
        location VARCHAR(150) DEFAULT NULL,
        year INT DEFAULT NULL,
        commencement_date DATE DEFAULT NULL,
        executive_summary TEXT DEFAULT NULL,
        description TEXT DEFAULT NULL,
        thumbnail_url VARCHAR(500) NOT NULL,
        images TEXT DEFAULT NULL,
        is_featured BOOLEAN DEFAULT FALSE,
        status VARCHAR(20) DEFAULT 'Completed',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create testimonials table
    console.log('Creating "testimonials" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        client_name VARCHAR(100) NOT NULL,
        company VARCHAR(100) DEFAULT NULL,
        designation VARCHAR(50) DEFAULT NULL,
        quote TEXT NOT NULL,
        rating INT DEFAULT 5,
        is_approved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create leads_quotes table
    console.log('Creating "leads_quotes" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads_quotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) DEFAULT NULL,
        project_type VARCHAR(50) NOT NULL,
        budget_range VARCHAR(50) DEFAULT NULL,
        description TEXT NOT NULL,
        attachment_url TEXT DEFAULT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create job_applications table
    console.log('Creating "job_applications" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS job_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        position VARCHAR(100) NOT NULL,
        experience VARCHAR(50) NOT NULL,
        message TEXT,
        resume_url LONGTEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create job_openings table
    console.log('Creating "job_openings" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS job_openings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) NOT NULL,
        department VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        experience VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create gallery_items table
    console.log('Creating "gallery_items" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS gallery_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100) DEFAULT NULL,
        image_url VARCHAR(500) NOT NULL,
        category VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Create team_members table
    console.log('Creating "team_members" table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(100) NOT NULL,
        image_url VARCHAR(500) DEFAULT NULL,
        bio TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB;
    `);

    // Seed Data
    console.log('Seeding initial data...');
    
    // 1. Seed Admin User
    const [existingUsers] = await connection.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (existingUsers.length === 0) {
      const passHash = hashPassword('admin123');
      await connection.query(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        ['admin', passHash, 'admin']
      );
      console.log('Seeded default admin user (username: admin, password: admin123)');
    }

    // 2. Seed Services
    const [existingServices] = await connection.query('SELECT COUNT(*) as count FROM services');
    if (existingServices[0].count === 0) {
      const services = [
        {
          title: 'Structural Audit',
          description: 'Comprehensive evaluation of building stability, identifying structural weaknesses and recommending precise engineering interventions.',
          icon: 'plumbing',
          order_index: 1
        },
        {
          title: 'Building Repairs',
          description: 'High-grade concrete and masonry rehabilitation restoring structural integrity and extending the lifespan of critical assets.',
          icon: 'foundation',
          order_index: 2
        },
        {
          title: 'Waterproofing',
          description: 'Advanced elastomeric and crystalline waterproofing systems designed to withstand extreme hydrostatic pressure in industrial facilities.',
          icon: 'water_drop',
          order_index: 3
        },
        {
          title: 'RCC Repairs',
          description: 'Specialized reinforced cement concrete repairs addressing corrosion and spalling with high-strength polymer-modified mortars.',
          icon: 'construction',
          order_index: 4
        },
        {
          title: 'Consultancy',
          description: 'Expert advisory services for project management, risk mitigation, and compliance with stringent civil engineering standards.',
          icon: 'precision_manufacturing',
          order_index: 5
        },
        {
          title: 'Renovation',
          description: 'Strategic structural upgrades and retrofitting to modernize aging infrastructure while minimizing operational downtime.',
          icon: 'format_paint',
          order_index: 6
        }
      ];

      for (const service of services) {
        await connection.query(
          'INSERT INTO services (title, description, icon, order_index) VALUES (?, ?, ?, ?)',
          [service.title, service.description, service.icon, service.order_index]
        );
      }
      console.log('Seeded 6 default core competency services.');
    }

    // 3. Seed some projects
    const [existingProjects] = await connection.query('SELECT COUNT(*) as count FROM projects');
    if (existingProjects[0].count === 0) {
      const projects = [
        {
          title: 'City Center Mall',
          category: 'Commercial',
          client: 'Apex Retail Group',
          location: 'Sector 45, Tech City',
          year: 2024,
          description: 'Full structural audit, deep foundation laying, and primary RCC superstructure construction.',
          thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVUfG99DkJw8P0VBdAQ-R0b36zRQSe5qLrJupQxBq57RaEfzN_6r_O6S0VDTcoc2S0HZ6NMFsbXqCdXLKD_NAjnBVP_E0uaLXgW2vo8Asn424OYfA96w_JUZARokhB-O_BPoJaB2OjIdzOXxQ9Rwffr3yHoMiyEj7fQXxMHWHQf6u9irmvwyd_8RMFtCuGtq7FUK-bsyoDjK_QooF2gVislCVMv0zX-iBUyfsPHabFW3dPv5dY0nu5DXw8hSipjh4vS0SJmeLs1jM',
          status: 'Completed',
          is_featured: true
        },
        {
          title: 'Industrial Warehouse Block B',
          category: 'Industrial',
          client: 'Logix Logistics',
          location: 'Industrial Estate, Phase 2',
          year: 2024,
          description: 'Erection of pre-engineered steel frames, heavy-duty industrial flooring, and roofing installation.',
          thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMWGiMra6an6R1IBckSYOemZwkV54z6FKl-puBR5J8CHYVWoVO1MJ_QRN6LwqTPXtixkTT1QoSanW-xZ3sdLvqmacUzKzLSRE8ChJVCF_fg0ir2KKVzQFbkjEje_TPT0bvrSyUOanMbs_xVt3hIgyYIaB60o5jPvxy_PX8dQEyD-J7u3Oj1Nksit-CL4AnIkeKTVHeWEIiWR-rBokGsP7MioCjDKS-j3nYp3b6C9QOCdYYPIWG4sOu7aMXZ3BSquxjNumL8rX79Rk',
          status: 'Ongoing',
          is_featured: true
        },
        {
          title: 'Luxury Residential Villa',
          category: 'Residential',
          client: 'Private Owner',
          location: 'Hillview Orchards',
          year: 2023,
          description: 'Turnkey construction encompassing specialized retaining walls, intricate formwork, and premium finishing.',
          thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAY9EHZCP1z4pPbwV7T1YM22oQQeWWqU5wce8IQ70xYjc2zNFB1MNhFOA3Y0_WXD2h9jiaoYdt7vP_TrVMZ4UD5xtqirbruQVjY2YJqm0ASa30OkpijUAWFTK6BmxA4jgc5RRS40-IIL9LpOt8OOe3JHzR6LaTM1iVG3WcSOAIxhI8k5altgj8co5E6bn0uAOZSorx1pUEFYHvKJ2v57U1xTVviCP3yPOt6Y3sVVBbycW3WQoSWLtnCSelw7KmY77w8W4Sk7XqQSEw',
          status: 'Completed',
          is_featured: true
        },
        {
          title: 'Municipal Water Facility',
          category: 'Infrastructure',
          client: 'City Corporation',
          location: 'North District',
          year: 2023,
          description: 'Specialized concrete pouring for water containment structures, heavy equipment anchoring, and site grading.',
          thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBo6jb1gcQ3yQhYZAZXDbTHSu4nMCTxTExlb9u-BXuDtZvei3GemD7jdVIFViFUlyLhj6GRBlOfVSZ_3-4O1t0DT8W-9qF3tIDZTeSgy4rAYXc7Nkl0aOFgeGHjb1Gj9mV7glByz8iNV-UsoTRnJK16EAJ57g_9offZ3k7c-_0q9eOHIavzao6pqAT96MmJOKniMYmPT_KeL5ouk1SmV5I3W1Gmi1qh7H6GbDln9csXxXhD1P1etOKudyLs502gXgPyfltYsrYXMk',
          status: 'Completed',
          is_featured: false
        },
        {
          title: 'Tech Park Tower C',
          category: 'Commercial',
          client: 'DevTech Infrastructures',
          location: 'Cyber Hub',
          year: 2024,
          description: 'High-rise structural framework, continuous concrete core pouring, and multi-level slab construction.',
          thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDKEZ2uaJJOO1Cy4IKaU4uvAtRnykl3-KjvrmxBs835y7qQpe3CuIr-oOwbCfzpiwfImxrURHa7xy2xGwdmBiRYgF0r1-5K-ZpFI3Goyz0AUYP42xALGusK0nzPn8lcoR4NlhnlTDvr8AUmG4MByYltCro8PQkME1nZyAb1kT30t8wVF2l7_GF_T0VLsNobN9u3w5ZBGCNSl6k-RcnoFKW1ma9AJfdYKMs1G9XRzTmt1Ob6Xi4rP-C1KvnJp4Wp8V0bWqXbR5iIy1A',
          status: 'Ongoing',
          is_featured: false
        },
        {
          title: 'Highway Overpass 42',
          category: 'Infrastructure',
          client: 'National Highway Board',
          location: 'Interstate Junction',
          year: 2022,
          description: 'Civil engineering infrastructure including deep pile foundations, precast girder installation, and road surfacing.',
          thumbnail_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDoWSghDkJAYb2U8gzm8y5GAm86fP_bvP34W-wHkYZ9kZcdvVA7IQLRJjq2NkA28uNAFnpyE9-lAbLWvmMypZzpaanVkImqbiyDEGZvS-K-9-9_k8e410yPAkAW6LAZU7uUug-9kQhENwHiKLjIrwk5WZWKfxSeB8wS_wIGvauWZp2PMVO9F2KBW-hLQnR1G-saYuaxZWTG0WTRwT4whB0_li9ypr0nyz_X9resE-Ya50Ykuqm_8ti_CHlLorQ390fRdl87Z2GPyec',
          status: 'Completed',
          is_featured: false
        }
      ];

      for (const proj of projects) {
        await connection.query(
          'INSERT INTO projects (title, category, client, location, year, description, thumbnail_url, status, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [proj.title, proj.category, proj.client, proj.location, proj.year, proj.description, proj.thumbnail_url, proj.status, proj.is_featured]
        );
      }
      console.log('Seeded sample projects.');
    }

    // 4. Seed Testimonials
    const [existingTestimonials] = await connection.query('SELECT COUNT(*) as count FROM testimonials');
    if (existingTestimonials[0].count === 0) {
      const testimonials = [
        {
          client_name: 'Rajesh Mehta',
          company: 'Mehta Logistics Hub',
          designation: 'Managing Director',
          quote: 'Prem Civil Tech resolved our severe warehouse floor cracking and waterproofing issues within record time. Their engineering precision is exceptional.',
          rating: 5,
          is_approved: true
        },
        {
          client_name: 'Sarah D\'Souza',
          company: 'Heights Residential Association',
          designation: 'Committee President',
          quote: 'We hired them for a complete structural audit and RCC rehabilitation. Honest consulting, strict safety compliance, and no hidden charges.',
          rating: 5,
          is_approved: true
        }
      ];

      for (const test of testimonials) {
        await connection.query(
          'INSERT INTO testimonials (client_name, company, designation, quote, rating, is_approved) VALUES (?, ?, ?, ?, ?, ?)',
          [test.client_name, test.company, test.designation, test.quote, test.rating, test.is_approved]
        );
      }
      console.log('Seeded testimonials.');
    }

    console.log('Database and schema setup successfully completed.');
  } catch (err) {
    console.error('Error during database setup:', err);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

main();
