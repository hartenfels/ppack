import gulp           from 'gulp';
import merge          from 'merge-stream';
import changedInPlace from 'gulp-changed-in-place';
import project        from '../aurelia.json';

export default function copyNpmResources() {
  let out = project.platform.output;

  return merge(
    gulp.src('node_modules/bootswatch/cerulean/bootstrap.min.css')
        .pipe(changedInPlace({firstPass: true}))
        .pipe(gulp.dest(out + '/css'))
  );
}
