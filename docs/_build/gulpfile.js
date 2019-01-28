var gulp = require('gulp');
const swaggerJSDoc = require('swagger-jsdoc');
var rmLines = require('gulp-rm-lines');
var fs = require('fs');
var async = require('async');
var tap = require('gulp-tap');

const swaggerDefinition = {
    info: {
        // API informations (required)
        title: 'Hello World', // Title (required)
        version: '1.0.0', // Version (required)
        description: 'A sample API', // Description (optional)
    },
    host: 'https://api.anymessage.io', // Host (optional)
    basePath: '/', // Base path (optional)
};

const options = {
    swaggerDefinition,
    apis: ['../../api/src/**/*.ts'], // <-- not in the definition, but in the options
};

function convertHTML(str) {
    var entityPairs = [
        { character: '@', html: '&#64;' },
        { character: '<', html: '&lt;' },
        { character: '>', html: '&gt;' },
        { character: "'", html: '&apos;' },
        { character: '"', html: '&quot;' },
    ];

    entityPairs.forEach(function (pair) {
        var reg = new RegExp(pair.character, 'g');
        str = str.replace(reg, pair.html);
    });
    return str;
}

gulp.task('swagger', function (cb) {
    const swaggerSpec = swaggerJSDoc(options);
    return fs.writeFile('../api/swagger.json', JSON.stringify(swaggerSpec), cb);
})

gulp.task('typedoc', function () {
    return gulp.src('./temp/**/*.html')
        .pipe(tap(function (file, t) {
            let title = file.contents.toString().match(/<title[^>]*>([^<]+)<\/title>/)[1];
            file.contents = Buffer.concat([
                new Buffer(`---\nlayout: typedoc\ntitle: \'${convertHTML(title)}\'\ncategory: docs\n---\n`),
                file.contents
            ]);
        }))
        .pipe(rmLines({
            'filters': [
                /<script\s+src=['"]/i,
                /<link\s+rel=['"]stylesheet['"]/i,
                /<meta/,
                /<head/,
                /<title/,
                /<\/head/,
                /<body/,
                /<\/body/,
                /<\!doctype html>/,
                /<html/,
                /<\/html/
            ]
        }))
        // .pipe(concat.header('---\nlayout: typedoc\n---\n'))
        .pipe(gulp.dest('../api/typedoc'));
})

gulp.task('assets', function () {
    return gulp.src('./temp/assets/**').pipe(gulp.dest('../api/typedoc/assets'));
})

gulp.task('favicons', function () {
    return gulp.src('../../ui/static/*').pipe(gulp.dest('../img'));
})

gulp.task('cleanup', function (callback) {
    // see https://stackoverflow.com/a/25069828
    function removeFolder(location, next) {
        fs.readdir(location, function (err, files) {
            async.each(files, function (file, cb) {
                file = location + '/' + file
                fs.stat(file, function (err, stat) {
                    if (err) {
                        return cb(err);
                    }
                    if (stat.isDirectory()) {
                        removeFolder(file, cb);
                    } else {
                        fs.unlink(file, function (err) {
                            if (err) {
                                return cb(err);
                            }
                            return cb();
                        })
                    }
                })
            }, function (err) {
                if (err) return next(err)
                fs.rmdir(location, function (err) {
                    return next(err)
                })
            })
        })
    }
    removeFolder('./temp', callback);
})

gulp.task('default', gulp.series(gulp.parallel('swagger', 'typedoc', 'assets', 'favicons'), 'cleanup'));