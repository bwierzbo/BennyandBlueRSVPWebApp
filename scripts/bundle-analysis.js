#!/usr/bin/env node

/**
 * Bundle size analysis script for RSVP application
 * Analyzes and reports on bundle size optimization opportunities
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.buildDir = path.join(this.projectRoot, '.next');
    this.analysisResults = {};
  }

  // Analyze component sizes
  analyzeComponentSizes() {
    const componentsDir = path.join(this.projectRoot, 'components');
    const components = this.getJSFiles(componentsDir);

    console.log('📦 Component Size Analysis');
    console.log('========================');

    const componentSizes = components.map(file => {
      const fullPath = path.join(componentsDir, file);
      const stats = fs.statSync(fullPath);
      const content = fs.readFileSync(fullPath, 'utf8');

      // Count imports, exports, and LOC
      const imports = (content.match(/^import .+$/gm) || []).length;
      const exports = (content.match(/^export .+$/gm) || []).length;
      const loc = content.split('\n').length;

      return {
        file,
        size: stats.size,
        loc,
        imports,
        exports,
        sizePerLoc: stats.size / loc
      };
    });

    // Sort by size
    componentSizes.sort((a, b) => b.size - a.size);

    componentSizes.forEach(comp => {
      console.log(`  ${comp.file}: ${this.formatBytes(comp.size)} (${comp.loc} LOC, ${comp.imports} imports)`);
    });

    this.analysisResults.components = componentSizes;
  }

  // Analyze lib file sizes
  analyzeLibSizes() {
    const libDir = path.join(this.projectRoot, 'lib');
    const libFiles = this.getJSFiles(libDir);

    console.log('\n📚 Library Size Analysis');
    console.log('========================');

    const libSizes = libFiles.map(file => {
      const fullPath = path.join(libDir, file);
      const stats = fs.statSync(fullPath);
      const content = fs.readFileSync(fullPath, 'utf8');

      // Analyze functions and complexity
      const functions = (content.match(/(?:function|const\s+\w+\s*=\s*(?:\w+\s*)?(?:\(.*?\)\s*)?=>|export\s+(?:async\s+)?function)/g) || []).length;
      const loc = content.split('\n').length;

      return {
        file,
        size: stats.size,
        loc,
        functions,
        sizePerLoc: stats.size / loc
      };
    });

    libSizes.sort((a, b) => b.size - a.size);

    libSizes.forEach(lib => {
      console.log(`  ${lib.file}: ${this.formatBytes(lib.size)} (${lib.loc} LOC, ${lib.functions} functions)`);
    });

    this.analysisResults.lib = libSizes;
  }

  // Analyze dependency sizes
  analyzeDependencies() {
    console.log('\n📦 Dependency Analysis');
    console.log('======================');

    try {
      const packageJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8'));
      const dependencies = packageJson.dependencies || {};

      const largeDeps = [
        'react',
        'react-dom',
        'next',
        'react-hook-form',
        '@hookform/resolvers',
        'zod',
        '@vercel/postgres'
      ];

      largeDeps.forEach(dep => {
        if (dependencies[dep]) {
          console.log(`  ${dep}: ${dependencies[dep]}`);
        }
      });

      // Check for potential optimization opportunities
      console.log('\n🔍 Optimization Opportunities:');

      // Check for unused dependencies
      const allDeps = Object.keys(dependencies);
      const potentiallyUnused = allDeps.filter(dep => {
        // Simple heuristic: check if dependency name appears in source files
        try {
          execSync(`grep -r "${dep}" ${this.projectRoot}/components ${this.projectRoot}/lib ${this.projectRoot}/app 2>/dev/null`);
          return false;
        } catch {
          return true;
        }
      });

      if (potentiallyUnused.length > 0) {
        console.log(`  • Potentially unused dependencies: ${potentiallyUnused.join(', ')}`);
      }

      // Check for bundle optimization flags
      const nextConfig = path.join(this.projectRoot, 'next.config.js');
      if (!fs.existsSync(nextConfig)) {
        console.log('  • Consider adding next.config.js for bundle optimization');
      }

    } catch (error) {
      console.log('  Unable to analyze dependencies:', error.message);
    }
  }

  // Analyze build output (if available)
  analyzeBuildOutput() {
    console.log('\n🏗️  Build Output Analysis');
    console.log('=========================');

    const staticDir = path.join(this.buildDir, 'static');
    if (!fs.existsSync(staticDir)) {
      console.log('  No build output found. Run `npm run build` first.');
      return;
    }

    try {
      // Find largest chunks
      const jsFiles = this.findFiles(staticDir, '.js');
      const jsFileSizes = jsFiles.map(file => {
        const stats = fs.statSync(file);
        return {
          file: path.relative(staticDir, file),
          size: stats.size
        };
      });

      jsFileSizes.sort((a, b) => b.size - a.size);

      console.log('  Largest JavaScript chunks:');
      jsFileSizes.slice(0, 10).forEach(chunk => {
        console.log(`    ${chunk.file}: ${this.formatBytes(chunk.size)}`);
      });

      const totalJSSize = jsFileSizes.reduce((sum, chunk) => sum + chunk.size, 0);
      console.log(`  Total JS bundle size: ${this.formatBytes(totalJSSize)}`);

      // CSS files
      const cssFiles = this.findFiles(staticDir, '.css');
      if (cssFiles.length > 0) {
        const totalCSSSize = cssFiles.reduce((sum, file) => sum + fs.statSync(file).size, 0);
        console.log(`  Total CSS size: ${this.formatBytes(totalCSSSize)}`);
      }

    } catch (error) {
      console.log('  Error analyzing build output:', error.message);
    }
  }

  // Performance recommendations
  generateRecommendations() {
    console.log('\n💡 Performance Recommendations');
    console.log('===============================');

    const recommendations = [];

    // Component recommendations
    if (this.analysisResults.components) {
      const largeComponents = this.analysisResults.components.filter(c => c.size > 5000);
      if (largeComponents.length > 0) {
        recommendations.push(`Consider splitting large components: ${largeComponents.map(c => c.file).join(', ')}`);
      }

      const heavyImportComponents = this.analysisResults.components.filter(c => c.imports > 10);
      if (heavyImportComponents.length > 0) {
        recommendations.push(`Review import dependencies in: ${heavyImportComponents.map(c => c.file).join(', ')}`);
      }
    }

    // General recommendations
    recommendations.push('Consider implementing dynamic imports for route-level code splitting');
    recommendations.push('Use React.memo() for components that re-render frequently');
    recommendations.push('Implement useMemo() and useCallback() for expensive calculations');
    recommendations.push('Consider lazy loading of non-critical components');

    recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }

  // Helper methods
  getJSFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir)
      .filter(file => file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js'))
      .filter(file => !file.endsWith('.test.ts') && !file.endsWith('.test.tsx'));
  }

  findFiles(dir, extension) {
    const files = [];
    if (!fs.existsSync(dir)) return files;

    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.findFiles(fullPath, extension));
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  }

  // Run complete analysis
  runAnalysis() {
    console.log('🔍 RSVP Application Bundle Analysis');
    console.log('===================================');
    console.log(`Project: ${this.projectRoot}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('');

    this.analyzeComponentSizes();
    this.analyzeLibSizes();
    this.analyzeDependencies();
    this.analyzeBuildOutput();
    this.generateRecommendations();

    console.log('\n✨ Analysis complete!');
  }
}

// CLI runner
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.runAnalysis();
}

module.exports = { BundleAnalyzer };